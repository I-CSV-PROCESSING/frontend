
"use client"
import React, { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import TabComponent from './components/upload';

export default function Home() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <div className="h-screen">
      <Box sx={{ display: 'flex' }}
        className="h-1/8 flex justify-center mt-5">
        <Tabs
          value={value}
          onChange={handleChange}
          sx={{
            '& .MuiTab-root': {
              color: 'white',
              '&.Mui-selected': {
                color: 'lightblue',
              },
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              },
            },
          }}
        >
          <Tab label="Upload" {...a11yProps(0)} />
          <Tab label="View Data" {...a11yProps(1)} />
        </Tabs>
      </Box>
      <div className='h-3/4 content-center'>
        <CustomTabPanel value={value} index={0}>
          <TabComponent onTabSwitch={handleChange}></TabComponent>
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
        </CustomTabPanel>
      </div>
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  };
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}