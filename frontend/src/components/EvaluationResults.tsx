import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Chip,
  IconButton,
  Collapse,
  TablePagination,
  Tooltip,
} from '@mui/material';
import {
  KeyboardArrowDown as ExpandMoreIcon,
  KeyboardArrowUp as ExpandLessIcon,
} from '@mui/icons-material';

interface Score {
  correctness: number;
  faithfulness: number;
}

interface ModelResponse {
  model: string;
  response: string;
  scores: Score;
  error?: string;
}

interface Result {
  rowIndex: number;
  generatedPrompt: string;
  responses: ModelResponse[];
  error?: string;
}

interface EvaluationResultsProps {
  results: Result[];
  datasetData: any[];
}

const EvaluationResults: React.FC<EvaluationResultsProps> = ({ results, datasetData }) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [expandedRows, setExpandedRows] = useState<number[]>([]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const toggleRow = (rowIndex: number) => {
    setExpandedRows(prev =>
      prev.includes(rowIndex)
        ? prev.filter(index => index !== rowIndex)
        : [...prev, rowIndex]
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'success';
    if (score >= 6) return 'warning';
    return 'error';
  };

  const calculateAggregateMetrics = () => {
    const metrics = {
      gemini: { correctness: 0, faithfulness: 0, count: 0 },
      groq: { correctness: 0, faithfulness: 0, count: 0 },
      groq2: { correctness: 0, faithfulness: 0, count: 0 }
    };

    results.forEach(result => {
      result.responses.forEach(response => {
        if (response.model === 'gemini') {
          metrics.gemini.correctness += response.scores.correctness;
          metrics.gemini.faithfulness += response.scores.faithfulness;
          metrics.gemini.count++;
        } else if (response.model === 'groq') {
          metrics.groq.correctness += response.scores.correctness;
          metrics.groq.faithfulness += response.scores.faithfulness;
          metrics.groq.count++;
        } else if(response.model === 'groq2') {
          metrics.groq2.correctness += response.scores.correctness;
          metrics.groq2.faithfulness += response.scores.faithfulness;
          metrics.groq2.count++;
        }
      });
    });

    return {
      gemini: {
        correctness: metrics.gemini.count ? (metrics.gemini.correctness / metrics.gemini.count).toFixed(2) : 0,
        faithfulness: metrics.gemini.count ? (metrics.gemini.faithfulness / metrics.gemini.count).toFixed(2) : 0
      },
      groq: {
        correctness: metrics.groq.count ? (metrics.groq.correctness / metrics.groq.count).toFixed(2) : 0,
        faithfulness: metrics.groq.count ? (metrics.groq.faithfulness / metrics.groq.count).toFixed(2) : 0
      },
      groq2: {
        correctness: metrics.groq2.count ? (metrics.groq2.correctness / metrics.groq2.count).toFixed(2) : 0,
        faithfulness: metrics.groq2.count ? (metrics.groq2.faithfulness / metrics.groq2.count).toFixed(2) : 0
      }
    };
  };

  const aggregateMetrics = calculateAggregateMetrics();

  return (
    <Box>
      {/* Aggregate Metrics */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2 }}>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" gutterBottom>Gemini Aggregate Scores</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Chip
              label={`Correctness: ${aggregateMetrics.gemini.correctness}`}
              color={getScoreColor(Number(aggregateMetrics.gemini.correctness))}
            />
            <Chip
              label={`Faithfulness: ${aggregateMetrics.gemini.faithfulness}`}
              color={getScoreColor(Number(aggregateMetrics.gemini.faithfulness))}
            />
          </Box>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" gutterBottom>Groq Aggregate Scores</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Chip
              label={`Correctness: ${aggregateMetrics.groq.correctness}`}
              color={getScoreColor(Number(aggregateMetrics.groq.correctness))}
            />
            <Chip
              label={`Faithfulness: ${aggregateMetrics.groq.faithfulness}`}
              color={getScoreColor(Number(aggregateMetrics.groq.faithfulness))}
            />
          </Box>
        </Paper>
        <Paper sx={{ p: 2, flex: 1 }}>
          <Typography variant="h6" gutterBottom>Groq2 Aggregate Scores</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Chip
              label={`Correctness: ${aggregateMetrics.groq2.correctness}`}
              color={getScoreColor(Number(aggregateMetrics.groq2.correctness))}
            />
            <Chip
              label={`Faithfulness: ${aggregateMetrics.groq2.faithfulness}`}
              color={getScoreColor(Number(aggregateMetrics.groq2.faithfulness))}
            />
          </Box>
        </Paper>
      </Box>

      {/* Results Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell />
              <TableCell>Row</TableCell>
              <TableCell>Dataset Values</TableCell>
              <TableCell>Generated Prompt</TableCell>
              <TableCell>Responses</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {results
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((result) => (
                <React.Fragment key={result.rowIndex}>
                  <TableRow>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => toggleRow(result.rowIndex)}
                      >
                        {expandedRows.includes(result.rowIndex) ? (
                          <ExpandLessIcon />
                        ) : (
                          <ExpandMoreIcon />
                        )}
                      </IconButton>
                    </TableCell>
                    <TableCell>{result.rowIndex + 1}</TableCell>
                    <TableCell>
                      <Box sx={{ maxWidth: 300 }}>
                        {Object.entries(datasetData[result.rowIndex] || {}).map(([key, value]) => (
                          <Typography key={key} variant="body2">
                            <strong>{key}:</strong> {String(value)}
                          </Typography>
                        ))}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Tooltip title={result.generatedPrompt}>
                        <Typography sx={{ maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {result.generatedPrompt}
                        </Typography>
                      </Tooltip>
                    </TableCell>
                    <TableCell>
                      {result.responses.map((response, index) => (
                        <Box key={index} sx={{ mb: 1 }}>
                          <Typography variant="subtitle2" color="primary">
                            {response.model.toUpperCase()}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                            <Chip
                              size="small"
                              label={`Correctness: ${response.scores.correctness}`}
                              color={getScoreColor(response.scores.correctness)}
                            />
                            <Chip
                              size="small"
                              label={`Faithfulness: ${response.scores.faithfulness}`}
                              color={getScoreColor(response.scores.faithfulness)}
                            />
                          </Box>
                        </Box>
                      ))}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                      <Collapse in={expandedRows.includes(result.rowIndex)} timeout="auto" unmountOnExit>
                        <Box sx={{ margin: 2 }}>
                          <Typography variant="h6" gutterBottom component="div">
                            Detailed Responses
                          </Typography>
                          {result.responses.map((response, index) => (
                            <Box key={index} sx={{ mb: 2 }}>
                              <Typography variant="subtitle1" color="primary">
                                {response.model.toUpperCase()} Response:
                              </Typography>
                              <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                                <Typography variant="body2" style={{ whiteSpace: 'pre-wrap' }}>
                                  {response.response}
                                </Typography>
                              </Paper>
                            </Box>
                          ))}
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={results.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
};

export default EvaluationResults; 