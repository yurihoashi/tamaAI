import React, { useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    Box,
    Tabs,
    Tab,
    TextField,
    Button,
    Slider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    Snackbar,
} from '@mui/material';
import styled from '@emotion/styled';
import { updateSettings, UserSettings } from '../api/client';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

const StyledContainer = styled(Container)`
  padding-top: 2rem;
`;

const TabPanel = (props: TabPanelProps) => {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            {...other}
        >
            {value === index && <Box p={3}>{children}</Box>}
        </div>
    );
};

const App: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);
    const [settings, setSettings] = useState<UserSettings>({
        sleepTime: '22:00',
        wakeTime: '07:00',
        screenTimeLimit: 120, // minutes
        unhealthyFoodLimit: 3, // per week
    });
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: 'success' | 'error';
    }>({
        open: false,
        message: '',
        severity: 'success',
    });

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleSettingChange = (setting: keyof UserSettings, value: any) => {
        setSettings(prev => ({
            ...prev,
            [setting]: value,
        }));
    };

    const handleSaveSettings = async () => {
        try {
            await updateSettings(settings);
            setSnackbar({
                open: true,
                message: 'Settings saved successfully!',
                severity: 'success',
            });
        } catch (error) {
            setSnackbar({
                open: true,
                message: 'Failed to save settings. Please try again.',
                severity: 'error',
            });
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    return (
        <StyledContainer>
            <Paper elevation={3}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={handleTabChange} centered>
                        <Tab label="Dashboard" />
                        <Tab label="Settings" />
                        <Tab label="Stats" />
                    </Tabs>
                </Box>

                <TabPanel value={tabValue} index={0}>
                    <Typography variant="h5" gutterBottom>
                        Welcome to TamaAI
                    </Typography>
                    <Typography paragraph>
                        Your digital wellness companion is here to help you maintain healthy habits.
                        Keep an eye on your pet's status and follow its guidance for a better lifestyle!
                    </Typography>
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    <Typography variant="h6" gutterBottom>
                        Wellness Settings
                    </Typography>

                    <Box sx={{ my: 2 }}>
                        <TextField
                            label="Sleep Time"
                            type="time"
                            value={settings.sleepTime}
                            onChange={(e) => handleSettingChange('sleepTime', e.target.value)}
                            fullWidth
                            margin="normal"
                        />

                        <TextField
                            label="Wake Time"
                            type="time"
                            value={settings.wakeTime}
                            onChange={(e) => handleSettingChange('wakeTime', e.target.value)}
                            fullWidth
                            margin="normal"
                        />

                        <Typography gutterBottom>
                            Screen Time Limit (minutes per day)
                        </Typography>
                        <Slider
                            value={settings.screenTimeLimit}
                            onChange={(e, value) => handleSettingChange('screenTimeLimit', value)}
                            min={30}
                            max={480}
                            valueLabelDisplay="auto"
                        />

                        <FormControl fullWidth margin="normal">
                            <InputLabel>Unhealthy Food Limit (per week)</InputLabel>
                            <Select
                                value={settings.unhealthyFoodLimit}
                                onChange={(e) => handleSettingChange('unhealthyFoodLimit', e.target.value)}
                            >
                                <MenuItem value={1}>1 time per week</MenuItem>
                                <MenuItem value={2}>2 times per week</MenuItem>
                                <MenuItem value={3}>3 times per week</MenuItem>
                                <MenuItem value={4}>4 times per week</MenuItem>
                                <MenuItem value={5}>5 times per week</MenuItem>
                            </Select>
                        </FormControl>

                        <Button
                            variant="contained"
                            color="primary"
                            fullWidth
                            sx={{ mt: 2 }}
                            onClick={handleSaveSettings}
                        >
                            Save Settings
                        </Button>
                    </Box>
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                    <Typography variant="h6" gutterBottom>
                        Your Progress
                    </Typography>
                    {/* TODO: Add charts and statistics */}
                    <Typography paragraph>
                        Statistics and progress tracking coming soon!
                    </Typography>
                </TabPanel>
            </Paper>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </StyledContainer>
    );
};

export default App; 