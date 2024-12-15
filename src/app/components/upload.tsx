"use client"
import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Typography
} from '@mui/material';
import { CloudUpload, Description } from '@mui/icons-material';

interface FileUploadProps {
  onTabSwitch: (event: React.SyntheticEvent, newValue: number) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onTabSwitch }) => {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | Error>('');
  const [success, setSuccess] = useState<boolean>(false);

  const handleFileChange = (event: { target: { files: any; }; }) => {
    if (event.target?.files[0]?.type !== "text/csv") {
      setError("Wrong File Type. Please upload only CSV file")
    } else {
      setFile(event.target.files[0]);
    }
  };

  const handleFileRemoval = async () => {
    setFile(null);
    setError('');
  };

  const handleDisplaySwitch = async (event: React.SyntheticEvent) => {
    onTabSwitch(event, 1);
  }

  const handleUpload = async (event: { preventDefault: () => void; }) => {
    event.preventDefault();
    const formData = new FormData();
    if (!file) {
      setError("No file selected for upload");
    } else {
      formData.append('csv_file', file);

      try {
        const response = await fetch('http://localhost:8000/csv-upload',
          {
            method: 'POST',
            body: formData,
          });
        //  formData, {});
        if (response.status !== 200) {
          throw new Error("Upload file failed with code " + response.status);
        }
        setSuccess(true);
      } catch (err: any) {
        console.log(err)
        setError(err);
      }
    }
  };

  return (
    <div className="flex justify-center">
      {!file &&
        <div>
          {
            error &&
            <Card variant="outlined" sx={{
              background: 'rgba(250, 154, 170, 0.35)',
              borderRadius: '6px',
              marginBottom: 2
            }}>
              <CardContent className='w-full'>
                <Typography sx={{ color: 'white', fontSize: 18 }}>
                  ERROR !
                </Typography>
                <Typography sx={{ color: '#FFDCD1', fontSize: 14 }}>
                  {error.toString()}
                </Typography>
              </CardContent>
            </Card>
          }
          <input
            type="file"
            id="file-upload"
            onChange={handleFileChange}
            multiple
            style={{ display: 'none' }
            }
          />
          < label htmlFor="file-upload" >
            <Button
              component="span"
              variant="outlined"
              style={{
                width: '600px',
                height: '400px',
                fontSize: '20px',
                border: '2px dashed white',
                color: 'white'
              }}
              startIcon={< CloudUpload />}
            >
              Upload csv file
            </Button>
          </label>
        </div>
      }
      {
        file &&
        <div>
          <Card variant="outlined" sx={{
            background: 'transparent',
            border: '1px solid white', // Optional: add a border
            borderRadius: '8px', // Optional: rounded corners
            boxShadow: 2, // Optional: add shadow for depth
          }}>
            <CardContent className='flex w-full m-2'>
              <Description style={{ color: 'lightblue', fontSize: 40 }} className='w-3/8 mr-4 self-center' />
              <div className='w-5/8'>

                <Typography sx={{ color: 'white', fontSize: 20 }}>
                  File name:&nbsp;
                  <span style={{ color: 'lightblue' }}>
                    {file.name}
                  </span>
                </Typography>
                <Typography sx={{ color: 'white', fontSize: 16 }}>
                  Size:&nbsp;
                  <span style={{ color: 'lightblue' }}>
                    {file.size}
                  </span>
                </Typography>
                <Typography sx={{ color: 'white', fontSize: 16 }}>
                  Type:&nbsp;
                  <span style={{ color: 'lightblue' }}>
                    {file.type}
                  </span>
                </Typography>
              </div>
            </CardContent>
            {
              success &&
              <Box sx={{ justifyContent: 'center', marginTop: 3, marginBottom: 1 }}>
                <Typography align="center" sx={{ color: 'rgb(151, 254, 151)', fontSize: 16 }}>
                  UPLOAD SUCCESS
                </Typography>
                <CardActions sx={{ justifyContent: 'center' }}>
                  <Button size="small" variant="text"
                    sx={{
                      paddingX: 2,
                      color: 'lightblue',
                      backgroundColor: 'rgb(195, 237, 247, 0.1)',
                      "&:hover": {
                        backgroundColor: 'rgb(13, 14, 15, 0.6)',
                        color: 'white',
                      }
                    }}
                    onClick={handleDisplaySwitch}>
                    Display Loaded Items
                  </Button>
                </CardActions>
              </Box>
            }
            {
              !success &&
              <CardActions sx={{ justifyContent: 'end' }}>
                <Button size="small" variant="text"
                  sx={{
                    paddingX: 2,
                    color: 'rgb(253, 123, 123)',
                    "&:hover": {
                      backgroundColor: 'rgb(253, 123, 123, 0.1)',
                      color: 'rgb(253, 123, 123)',
                    }
                  }}
                  onClick={handleFileRemoval}>
                  Remove
                </Button>
                <Button size="small" variant="text"
                  sx={{
                    paddingX: 2,
                    color: 'rgb(144, 238, 144)',
                    "&:hover": {
                      backgroundColor: 'rgb(151, 254, 151, 0.1)',
                      color: 'rgb(151, 254, 151)',
                    }
                  }}
                  onClick={handleUpload} >
                  Upload
                </Button>
              </CardActions>
            }
          </Card>

        </div>
      }
    </div >
  );
}

export default FileUpload;
