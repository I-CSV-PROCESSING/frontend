import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Typography,
  TablePagination,
  TextField,
  MenuItem,
} from '@mui/material';

interface KeySearch {
  key: string;
  value: string;
  operator: string;
}

interface KeySort {
  key: string;
  asc: boolean;
}

interface SearchFilters {
  limit: number;
  offset: number;
  filters: Array<KeySearch>;
  sort: Array<KeySort>
}

interface ResponseBody {
  data: Array<{ [key: string]: string }>;
}

const UserTable: React.FC = () => {
  const [dataPoints, setdataPoints] = useState<Array<{ [key: string]: string }>>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [headers, setHeaders] = useState<Array<string>>([]);
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [disableNext, setDisableNext] = useState<boolean>(false);
  const [searchKey, setSearchKey] = useState<string>('');
  const [searchValue, setSearchValue] = useState<string>('');

  const debouncedSearchKey = useDebounce(searchKey, 300);
  const debouncedSearchValue = useDebounce(searchValue, 300);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const filtersBody: SearchFilters = {
        limit: rowsPerPage,
        offset: page * rowsPerPage,
        filters: [],
        sort: []
      }

      if (debouncedSearchValue) {
        filtersBody.filters.push({
          key: debouncedSearchKey,
          value: debouncedSearchValue,
          operator: 'ilike'
        })
      }
      try {
        const response = await fetch('http://localhost:8000/search',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(filtersBody)
          });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const respData: ResponseBody = await response.json();
        const dp = respData.data
        if (dp.length !== 0) {
          findHeaders(dp)
        }

        // manual setting of last page
        setdataPoints(dp);
        if (dp.length < rowsPerPage) {
          setDisableNext(true)
        } else {
          const hasNextFilters = filtersBody
          hasNextFilters.offset = (page + 1) * rowsPerPage
          const hasNext = await fetch('http://localhost:8000/search',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(hasNextFilters)
            });
          const hasNextData: ResponseBody = await hasNext.json();
          if (hasNextData.data.length !== 1) {
            setDisableNext(true)
          } else {
            setDisableNext(false)
          }
        }

      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page, rowsPerPage, debouncedSearchValue]);

  const findHeaders = (data: Array<{ [key: string]: string }>) => {
    const keys: Array<string> = Object.keys(data[0]);
    setHeaders(keys.filter(x => x !== "_id"));
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const toChanged = parseInt(event.target.value, 10)
    setRowsPerPage(toChanged);
    setPage(0);
  };


  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return <Typography color="error">Error: {error}</Typography>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
        <TextField
          label="Search Key"
          variant="filled"
          select
          defaultValue={headers[0]}
          value={searchKey}
          focused
          helperText="Please select the key to search by"
          onChange={(e) => setSearchKey(e.target.value)}
          style={{ marginRight: '15px' }}
          sx={{
            '& .MuiInputBase-input': {
              backgroundColor: 'white',
            },
            '& .MuiFormHelperText-root': {
              color: 'white',
            },
          }}
        >
          {
            headers.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))
          }
        </TextField>
        <TextField
          label="Search Value"
          variant="filled"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          style={{ marginRight: '10px' }}
          focused
          sx={{
            '& .MuiInputBase-input': {
              backgroundColor: 'white',
            },
            '& .MuiFormHelperText-root': {
              color: 'white',
            },
          }}
        />
      </div>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
        <Paper sx={{ width: '80%', mb: 2, overflow: 'hidden' }}>
          <TableContainer component={Paper} sx={{ maxHeight: 560 }} >
            <Table stickyHeader>
              <TableHead>
                <TableRow sx={{ color: "blue" }}>
                  {
                    dataPoints.length > 0 &&
                    headers.map((header, index) => (
                      <TableCell key={`header-${index}`}>{header}</TableCell>
                    ))
                  }
                </TableRow>
              </TableHead>
              <TableBody>
                {dataPoints.length > 0 &&
                  dataPoints.map((data, index) => (
                    <TableRow key={`data-${index}`}>
                      {
                        headers.map((header, index) => (
                          <TableCell key={`value-${index}`}>{data[header]}</TableCell>
                        ))
                      }
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          {
            <TablePagination
              rowsPerPageOptions={[5, 10, 20]}
              component="div"
              count={-1}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              slotProps={{
                actions: {
                  nextButton: {
                    disabled: disableNext
                  }
                }
              }}
            />
          }
        </Paper>
      </div>
    </div >
  );
};

// Debounce Function
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};


export default UserTable;