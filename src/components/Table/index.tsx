import styled from 'styled-components'
import {
  TableContainer,
  TableHead,
  TableCell,
  TableRow,
  TableBody,
  makeStyles,
  Box,
  Typography
} from '@material-ui/core'
import useBreakpoint from '../../hooks/useBreakpoint'

interface StyleProps {
  isHeaderGray?: boolean
}

const Profile = styled.div`
  display: flex;
  align-items: center;
`

export const TableProfileImg = styled.div<{ url?: string }>`
  height: 24px;
  width: 24px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 8px;
  background: #000000 ${({ url }) => (url ? `url(${url})` : '')};
`

export function OwnerCell({ url, name }: { url?: string; name: string }) {
  return (
    <Profile>
      <TableProfileImg url={url} />
      {name}
    </Profile>
  )
}

const useStyles = makeStyles({
  root: {
    display: 'table',
    // backgroundColor: '#ffffff',
    borderRadius: '40px',
    '& .MuiTableCell-root': {
      fontSize: '16px',
      borderBottom: 'none',
      fontWeight: 400,
      padding: '14px 20px',
      '& svg': {
        marginRight: 8
      },
      '&:first-child': {
        paddingLeft: 50
      },
      '&:last-child': {
        paddingRight: 50
      }
    },
    '& table': {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: 0
    }
  },
  tableHeader: {
    borderRadius: 8,
    overflow: 'hidden',
    '& .MuiTableCell-root': {
      background: ({ isHeaderGray }: StyleProps) => (isHeaderGray ? 'rgba(255, 255, 255, 0.08)' : 'transparent'),
      padding: '12px 20px',
      fontSize: '12px',
      color: 'rgba(255,255,255,0.5)',
      borderBottom: ({ isHeaderGray }: StyleProps) => (isHeaderGray ? 'none' : '1px solid #000000'),
      '&:first-child': {
        paddingLeft: 50,
        borderTopLeftRadius: 8
      },
      '&:last-child': {
        paddingRight: 50,
        borderTopRightRadius: 8
      }
    }
  },
  tableRow: {
    height: 72,
    '& .MuiTableCell-root': {
      borderBottom: ({ isHeaderGray }: StyleProps) =>
        isHeaderGray ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid #999999'
    },
    '&:hover': {
      backgroundColor: ' rgba(255, 255, 255, 0.08)'
    }
  }
})

const Card = styled.div`
  background: #ffffff;
  border-radius: 30px;
  padding: 24px;
  > div {
    width: 100%;
  }
`

const CardRow = styled.div`
  display: flex;
  justify-content: space-between;
  grid-template-columns: auto 100%;
  > div:first-child {
    white-space: nowrap;
  }
  > div:last-child {
    width: 100%;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }
`

export default function Table({
  header,
  rows,
  isHeaderGray
}: {
  header: string[]
  rows: (string | number | JSX.Element)[][]
  isHeaderGray?: boolean
}) {
  const classes = useStyles({ isHeaderGray })
  const matches = useBreakpoint()
  return (
    <>
      {matches ? (
        <>
          {rows.map((data, index) => (
            <Card key={index}>
              <Box display="flex" flexDirection="column" gridGap="16px">
                {header.map((headerString, index) => (
                  <CardRow key={index}>
                    <Typography variant="h4">{headerString}</Typography>
                    <Typography style={{ color: '#000' }}> {data[index] ?? null}</Typography>
                  </CardRow>
                ))}
              </Box>
            </Card>
          ))}
        </>
      ) : (
        <TableContainer className={classes.root}>
          <table>
            <TableHead className={classes.tableHeader}>
              <TableRow>
                {header.map((string, idx) => (
                  <TableCell key={idx}>{string}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row, idx) => (
                <TableRow key={row[0].toString() + idx} className={classes.tableRow}>
                  {row.map((data, idx) => (
                    <TableCell key={idx}>{data}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </table>
        </TableContainer>
      )}
    </>
  )
}
