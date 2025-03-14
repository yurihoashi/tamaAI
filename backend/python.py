import ast
import logging
import os
import sys
import importlib

from model import (File, UserDefinedFunc , Call, UserDefinedClass,
                    Variable, LogicStatement)


AstControlType = (ast.If , ast.Try, ast.While, ast.IfExp)

UNKOWN_VAR = 'unknown'




def get_relative_path(file_path, level):
    """
    Removes the path parts relative to the given level and returns the new path.
    
    :param file_path: The original file path
    :param level: The number of levels to go up (remove that many parts from the path)
    :return: The new relative path
    """
    # Normalize the path (to handle things like . or ..)
    file_path = os.path.normpath(file_path)
    
    # Split the path into parts
    path_parts = file_path.split(os.sep)
    
    # Remove the number of parts specified by the level
    if level > 0:
        path_parts = path_parts[:-level]

    return '.'.join(path_parts)


def djoin(*tup):
    """
    Convenience method to join strings with dots
    :rtype: str
    """
    if len(tup) == 1 and isinstance(tup[0], list):
        return '.'.join(tup[0])
    return '.'.join(tup)


def extract_calls(value):
    """Recursively extract all calls, attributes, and variables."""
    calls = []
    if isinstance(value, ast.BinOp):  # Handle nested binary operations
        calls.extend(extract_calls(value.left))
        calls.extend(extract_calls(value.right))
    elif isinstance(value, ast.UnaryOp):
        calls.extend(extract_calls(value.operand))
    elif isinstance(value, ast.Call):  # Handle function calls
        calls.append(get_call_from_func_element(value))
    elif isinstance(value, ast.Attribute):  # Handle attributes like `dict.keys`
        # Extract parent and attribute
        if isinstance(value.value, ast.Attribute):
            parent = extract_calls(value.value) 
        elif isinstance(value.value, ast.Call):
            parent = get_call_from_func_element(value.value)
        elif isinstance(value.value , ast.Dict): 
            parent = value.value.id
        else:
            parent = extract_calls(value.value)
        if type(parent) == list and len(parent) == 1:
            [parent] = parent
        calls.append((parent, value.attr))  # Tuple of parent and attribute
    elif isinstance(value, ast.Name):  # Handle simple variable names
        calls.append(value.id)
    elif isinstance(value, ast.Subscript):  # Handle subscripts
        calls.extend(extract_calls(value.value))  # Extract from the subscripted element
        if hasattr(value, 'slice') and isinstance(value.slice, (ast.Name, ast.Attribute)):
            calls.extend(extract_calls(value.slice))
    elif isinstance(value, ast.JoinedStr):
        for _, val in enumerate(value.values):
            if isinstance(val, ast.FormattedValue):
                calls.extend(extract_calls(val.value))
    elif isinstance(value, ast.IfExp):
        body = extract_calls(value.body)
        orelse = extract_calls(value.orelse)
        test = extract_calls(value.test)
        logic_inst = LogicStatement('ifExp' , test , body , value.lineno , orelse)
        calls.append(logic_inst)
    else:
        calls.append(f"{type(value).__name__}")

    return calls


def get_call_from_func_element(value):
    """
    Given a python ast that represents a function call, clear and create our
    generic Call object. Some calls have no chance at resolution (e.g. array[2](param))
    so we return nothing instead.

    :param func ast:
    :rtype: Call|None
    """
    token_var = []
    if hasattr(value, 'args'):
        for arg in value.args:
            token_var.extend(extract_calls(arg))  # Process arguments
    if hasattr(value, 'keywords'): 
        for keyword in value.keywords:
            token_var.extend(extract_calls(keyword.value))   
    func = value.func
    assert type(func) in (ast.Attribute, ast.Name, ast.Subscript, ast.Call , ast.BinOp)
    if type(func) == ast.Attribute:

        
        owner_token = []
        val = func.value

        while True:
            try:
                owner_token.append(getattr(val, 'attr', val.id))
            except AttributeError:
                pass
            val = getattr(val, 'value', None)
            if not val:
                break
        if owner_token:
            owner_token = djoin(*reversed(owner_token))
        else:
            owner_token = UNKOWN_VAR
        function =  Call(func=func.attr, line_number=func.lineno, parent_token=owner_token, taken_var=token_var)
        if isinstance(type(func.value),ast.Name):
            op_example = extract_calls(func)
            return (op_example, function)
        else:
            return function

    if type(func) == ast.Name:
        return Call(func=func.id, line_number=func.lineno, parent_token = None , taken_var=token_var)
    if type(func) in (ast.Subscript, ast.Call):
        return None

def get_attr_from_non_func_element(attr):
    return( attr.id , attr.attr)

def process_assign(element):
    """
    Process an assignment AST node to extract variables and associated calls.
    Handles nested binary operations like `&`.
    
    :param element: An `Assign` node from the AST.
    :return: A list of Variable instances or an empty list if no valid assignment is found.
    """

    def extract_targets(target):
        """Recursively extract all variable names from assignment targets."""
        variables = []
        if isinstance(target, ast.Name):  # Handle simple variable names
            variables.append(target.id)
        elif isinstance(target, ast.Tuple):  # Handle tuple unpacking
            for elt in target.elts:  # Recursively process tuple elements
                variables.extend(extract_targets(elt))
        elif isinstance(target, ast.Attribute):  # Handle attributes
            variables.append((target.value.id, target.attr))  # Tuple of parent and attribute
        elif isinstance(target, ast.Subscript):
            sub = extract_calls(target.value)  # Extract from the subscripted element
            if hasattr(target, 'slice') and isinstance(target.slice, (ast.Name, ast.Attribute)):
                variables.append((sub , extract_calls(target.slice),))
            else:
                variables.append((sub, None))
        return variables
    
    # if not isinstance(element.value, (ast.BinOp, ast.Call, ast.Attribute, ast.Subscript)):
    #     return []  # Ignore non-call or non-operation assignments

    calls = extract_calls(element.value)
    # if not calls:  # No valid calls extracted
    #     return []

    ret = []
    if isinstance(element, ast.AugAssign):
        targets = [element.target]
    else:
        targets = element.targets
    

    variable_names = []
    for target in targets:
        # Extract all variable names from the target
        variable_names.extend(extract_targets(target))
  
    return Variable(variable_names, calls, element.lineno)


def make_operations(lines , is_root=False):
    operation = []
    for tree in lines:
        if is_root and check_rootnode(tree):
            return make_operations(tree.body)
        elif isinstance(tree, (ast.Assign, ast.AugAssign)):
            operation.append(process_assign(tree))

        elif isinstance(tree, AstControlType):
            if isinstance(tree, (ast.If )) and len(tree.orelse) != 0:
                else_branch = make_operations(tree.orelse)   
            else:
                else_branch = None
            line_no = tree.lineno
            cond_type = tree.__class__.__name__.lower()
            subtree = tree.body
            process = make_operations(subtree)
            test = None
            if not isinstance(tree, ast.Try):
                test = extract_calls(tree.test)
            logic_inst = LogicStatement(cond_type,test, process, line_no , else_branch)
            operation.append(logic_inst)
        else:
            if type(tree) == ast.Expr and type(tree.value) == ast.Call:
                call = get_call_from_func_element(tree.value)
                if call:
                    operation.append(call)
    return operation # return a list of  List[Tuple( [Call | Variables | Logic Statement ] , corresponding ast tree)]

def get_inherits(tree):
    """
    Get what superclasses this class inherits
    This handles exact names like 'MyClass' but skips things like 'cls' and 'mod.MyClass'
    Resolving those would be difficult
    :param tree ast:
    :rtype: list[str]
    """
    return [base.id for base in tree.bases if type(base) == ast.Name]

def check_rootnode(node):
    if isinstance(node, ast.If):  # Check if it's an `If` node
        # Check if the test is a comparison: __name__ == "__main__"
        if (
            isinstance(node.test, ast.Compare)
            and isinstance(node.test.left, ast.Name)
            and node.test.left.id == "__name__"
            and len(node.test.ops) == 1
            and isinstance(node.test.ops[0], ast.Eq)
            and len(node.test.comparators) == 1
            and isinstance(node.test.comparators[0], ast.Constant)
            and node.test.comparators[0].value == "main"
        ):
            return True
    return False

def make_constant(tree):
    result_list = []

    for el in tree:
        # Check for assignment of constants, dicts, lists, or tuples
        if isinstance(el, ast.Assign):
            # Iterate through all targets in the assignment
            for target in el.targets:
                # Ensure the target is a variable (ast.Name)
                if isinstance(target, ast.Name):
                    result_list.append(target.id)  # Append the variable name

    return result_list
        
def make_attribute(tree):
    attr = []
    def extract_self_attributes(node):
        """Recursively extract self attributes from any node."""
        if isinstance(node, ast.Assign):
            for target in node.targets:
                if isinstance(target, ast.Attribute) and isinstance(target.value, ast.Name) and target.value.id == "self":
                    attr.append(target.attr)
        # Recursively handle child nodes
        for child in ast.iter_child_nodes(node):
            extract_self_attributes(child)

    for statement in tree.body:
        extract_self_attributes(statement)
    return attr

def extract_outputs(node):
    """
    Recursively extract outputs from an AST node.

    Args:
        node (ast.AST): An AST node to analyze.

    Returns:
        list: A list of output variable names or expressions.
    """
    if isinstance(node, ast.Name):  # Single variable
        return [node.id]
    elif isinstance(node, ast.Tuple):  # Multiple return values
        return [extract_outputs(el) for el in node.elts]
    elif isinstance(node, ast.Call):  # Function call
        return [ast.dump(node)]  # Return the full call as a string
    elif isinstance(node, ast.Subscript):  # Subscript (e.g., dict[index])
        base = extract_outputs(node.value)
        index = extract_outputs(node.slice) if isinstance(node.slice, ast.AST) else node.slice
        return [(base, index)]
    elif isinstance(node, ast.Dict):  # Dictionary
        return [
            (extract_outputs(key), extract_outputs(value))
            for key, value in zip(node.keys, node.values)
        ]
    elif isinstance(node, ast.BoolOp):  # Boolean operation
        return [extract_outputs(value) for value in node.values]
    elif isinstance(node, ast.Constant):  # Literal constant
        return [node.value]
    elif isinstance(node, ast.BinOp):  # Binary operation
        left = extract_outputs(node.left)
        right = extract_outputs(node.right)
        return [("BinOp", left, right)]
    elif isinstance(node, list):  # Handle lists of nodes
        return [extract_outputs(el) for el in node]
    else:
        return [ast.dump(node)]  # Default case (fallback)

def make_function_io(tree):
    """
    Extract input arguments and output values from a function represented in an AST.

    Args:
        tree (ast.FunctionDef): The AST node for the function definition.

    Returns:
        tuple: A tuple with:
              - inputs (list): List of input argument names.
              - outputs (list): List of output variable names or expressions.
    """
    # Extract input arguments
    input_list = [arg.arg for arg in tree.args.args]
    if tree.args.kwarg:
        input_list.append(tree.args.kwarg.arg)  # Add **kwargs if present

    # Extract output values
    output_list = []
    for stmt in tree.body:
        if isinstance(stmt, ast.Return):
            output_list.extend(extract_outputs(stmt.value))

    # Flatten output_list if it contains nested lists
    output_list = [item for sublist in output_list for item in (sublist if isinstance(sublist, list) else [sublist])]

    return input_list, output_list


class Python():
    @staticmethod
    def get_tree(filename):
        """
        Get the entire AST for this file

        :param filename str:
        :rtype: ast
        """
        try:
            with open(filename) as f:
                raw = f.read()
        except ValueError:
            with open(filename, encoding='UTF-8') as f:
                raw = f.read()
        return ast.parse(raw)

    @staticmethod
    def separate_namespaces(tree):
        """
        Given an AST, recursively separate that AST into lists of ASTs for the
        subgroups, nodes, and body. This is an intermediate step to allow for
        cleaner processing downstream

        :param tree ast:
        :returns: tuple of group, node, and body trees. These are processed
                  downstream into real Groups and Nodes.
        :rtype: (list[ast], list[ast], list[ast])
        """
        groups = []
        nodes = []
        body = []
        import_list = [] # this is import from same file 
        for el in tree.body:
            if type(el) in (ast.FunctionDef, ast.AsyncFunctionDef):
                nodes.append(el)
            elif type(el) == ast.ClassDef:
                groups.append(el)
            elif getattr(el, 'body', None):
                body.append(el)
            elif type(el) in (ast.Import , ast.ImportFrom):
                import_list.append(el)
            else:
                body.append(el)
        return groups, nodes, body , import_list
    
    @staticmethod
    def make_function(tree, parent):
        """
        Given an ast of all the lines in a function, create the node along with the
        calls and variables internal to it.

        :param tree ast:
        :param parent Group:
        :rtype: list[Node]
        """

        token = tree.name
        line_number = tree.lineno
        input_list , output_list = make_function_io(tree)
        processes = make_operations(tree.body)
        docstring = ast.get_docstring(tree)

        return UserDefinedFunc(
            token, 
            processes , 
            line_number, 
            docstring, 
            input_list , 
            output_list
        )
    
    @staticmethod
    def make_class(tree, parent):
        assert type(tree) == ast.ClassDef
        _, node_trees, body_trees , _ = Python.separate_namespaces(tree)

        token = tree.name
        print("CLASS NAME")
        print(token)
        line_number = tree.lineno
        inherits = get_inherits(tree) 
        class_group = UserDefinedClass(token,line_number, inherits)
        for node_tree in node_trees:
            if isinstance(class_group, UserDefinedClass) and node_tree.name in ['__init__', '__new__']:
                class_group.assign_attribute(make_attribute(node_tree))
            else:
                class_group.add_function(Python.make_function(node_tree , parent=class_group))
        
        # NEXT PR NESTED CLASS
        return class_group

    @staticmethod
    def make_root_node(tree):
        return make_operations(tree, True), make_constant(tree)

    
    @staticmethod
    def resolve_import_path(import_path, base_dir):
        """
        Resolves an import path by iterating over the path parts and checking for valid directories.
        If the path is not found, starts from the base directory and appends until a valid directory is found.
        """
        if import_path == None:
            return None
        # Split the import into its parts
        path_parts = import_path.split('.')
        
        # Start from the base directory (repo root)
        current_path = base_dir
        
        # Try to resolve the path progressively
        partial_path = '.\\'
        for i in path_parts:
            partial_path = os.path.join(partial_path ,i)
            if partial_path in current_path or partial_path == current_path:
                continue
            elif current_path in partial_path:
                if os.path.isdir(partial_path):
                    continue
                else:
                    return None
            else:
                partial_path = partial_path.lstrip('.\\')
                partial_path = os.path.join(current_path,partial_path)
        if os.path.isdir(partial_path):
            return partial_path
        else:
            partial_path += '.py'
            if os.path.exists(partial_path):
                return partial_path
        return None
        
    
    @staticmethod
    def make_import(trees, file_path, raw_source_path):
        import_list = []

        for import_tree in trees:
            if isinstance(import_tree, ast.ImportFrom):
                # Handle 'from ... import ...' imports
                # print("AST TREE")
                # print(ast.dump(import_tree , indent=4))
                from_inst = import_tree.module
                level = import_tree.level
                if level != 0:
                    if from_inst == None:
                        from_inst = ''
                    from_inst = '.'.join([get_relative_path(file_path, level), from_inst])
                names_list = [
                    (alias.name, alias.asname) if alias.asname else alias.name
                    for alias in import_tree.names
                ]
                # Append the import directly

                import_path = Python.resolve_import_path(from_inst , raw_source_path) # only path check , not detailed enough
                if import_path:
                    import_list.append({import_path: names_list})
            
            elif isinstance(import_tree, ast.Import):
                # Handle 'import ...' imports
                names_list = [
                    (alias.name, alias.asname) if alias.asname else alias.name
                    for alias in import_tree.names
                ]
                # Append the import directly
                temp_list = []
                for i in names_list:
                    if Python.resolve_import_path(i , raw_source_path): # only path check , not detailed enough
                        temp_list.append(names_list)
                import_list.append(temp_list)
        
        return import_list
