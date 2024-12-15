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

  useEffect(() => {
    const fetchData = async () => {
      const filters = {
        limit: rowsPerPage,
        offset: page * rowsPerPage
      }
      setLoading(true);
      try {
        const response = await fetch('http://localhost:8000/search',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(filters)
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
          const hasNextFilters = {
            limit: 1,
            offset: (page + 1) * rowsPerPage
          }
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
  }, [page, rowsPerPage]);

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
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <Paper sx={{ width: '80%', mb: 2, overflow: 'hidden' }}>
        <TableContainer component={Paper} sx={{ maxHeight: 600 }} >
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
    </div >
  );
};

export default UserTable;