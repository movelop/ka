import {
  Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Paper, Skeleton,
} from '@mui/material';
import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';

// ─── Constants ────────────────────────────────────────────────────────────────

const HEADERS = [
  'Confirmation', 'Full Name', 'Email', 'Phone',
  'Check-In', 'Check-Out', 'Payment Ref', 'Room Type',
  'Room(s)', 'Action',
];

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

const formatName = (row) =>
  [row.lastName, row.firstName].filter(Boolean).join(' ');

const formatRooms = (roomNumbers = []) =>
  roomNumbers.join(', ') || '—';

// ─── Sub-components ───────────────────────────────────────────────────────────

const HeadCell = ({ children }) => (
  <TableCell
    className="dark:text-gray-200 font-semibold whitespace-nowrap"
    sx={{ fontWeight: 600, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}
  >
    {children}
  </TableCell>
);

const BodyCell = ({ children }) => (
  <TableCell className="dark:text-gray-200" sx={{ fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
    {children ?? '—'}
  </TableCell>
);

const SkeletonRows = () =>
  Array.from({ length: 5 }).map((_, i) => (
    <TableRow key={i}>
      {HEADERS.map((h) => (
        <TableCell key={h}>
          <Skeleton variant="text" width="80%" />
        </TableCell>
      ))}
    </TableRow>
  ));

// ─── Main Component ───────────────────────────────────────────────────────────

const TableData = () => {
  const { data, loading, error } = useFetch('/bookings/latest');
  const bookings = data?.bookings;

  return (
    <TableContainer
      component={Paper}
      className="dark:bg-secondary-dark-bg"
      sx={{ boxShadow: 'none', overflowX: 'auto' }}
    >
      <Table aria-label="Recent bookings table" size="small">

        <TableHead>
          <TableRow sx={{ borderBottom: '2px solid', borderColor: 'divider' }}>
            {HEADERS.map((h) => <HeadCell key={h}>{h}</HeadCell>)}
          </TableRow>
        </TableHead>

        <TableBody>
          {/* Loading state */}
          {loading && <SkeletonRows />}

          {/* Error state */}
          {error && (
            <TableRow>
              <TableCell colSpan={HEADERS.length} align="center" className="dark:text-gray-400">
                <p className="text-sm text-red-500 py-4">Failed to load bookings.</p>
              </TableCell>
            </TableRow>
          )}

          {/* Empty state */}
          {!loading && !error && !bookings?.length && (
            <TableRow>
              <TableCell colSpan={HEADERS.length} align="center">
                <p className="text-sm text-gray-400 py-4">No recent bookings found.</p>
              </TableCell>
            </TableRow>
          )}

          {/* Data rows */}
          {bookings?.map((row) => (
            <TableRow
              key={row._id}
              hover
              sx={{ '&:last-child td': { border: 0 } }}
            >
              <BodyCell>{row.confirmation}</BodyCell>
              <BodyCell>{formatName(row)}</BodyCell>
              <BodyCell>{row.email || '—'}</BodyCell>
              <BodyCell>{row.phone || '—'}</BodyCell>
              <BodyCell>{formatDate(row.startDate)}</BodyCell>
              <BodyCell>{formatDate(row.endDate)}</BodyCell>
              <BodyCell>{row.paymentReference || 'Cash'}</BodyCell>
              <BodyCell>{row.roomTitle}</BodyCell>
              <BodyCell>{formatRooms(row.roomNumbers)}</BodyCell>
              <TableCell>
                <Link
                  to={`/bookings/${row._id}`}
                  state={{ data: row }}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium border border-dotted border-blue-400 rounded px-2 py-1 hover:bg-blue-50 transition-colors"
                >
                  View
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>

      </Table>
    </TableContainer>
  );
};

export default TableData;