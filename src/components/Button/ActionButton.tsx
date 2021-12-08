import Button from './Button'
import Spinner from 'components/Spinner'
import { Typography } from '@mui/material'
import SecondaryButton from './SecondaryButton'

export default function ActionButton({
  error,
  pending,
  success,
  onAction,
  actionText,
  pendingText,
  height,
  width,
  disableAction,
  successText
}: {
  error?: string | undefined
  pending?: boolean
  success?: boolean
  onAction: (() => void) | undefined
  actionText: string
  pendingText?: string
  successText?: string
  height?: string
  width?: string
  disableAction?: boolean
}) {
  return (
    <>
      {error || pending ? (
        <>
          <SecondaryButton primary disabled height={height} width={width}>
            {pending ? (
              <>
                <Spinner marginRight={16} />
                {pendingText || 'Waiting Confirmation'}
              </>
            ) : (
              error
            )}
          </SecondaryButton>
        </>
      ) : success ? (
        <Button disabled height={height} width={width}>
          <Typography variant="inherit">{successText ?? actionText}</Typography>
        </Button>
      ) : (
        <Button height={height} width={width} onClick={onAction} disabled={disableAction}>
          {actionText}
        </Button>
      )}
    </>
  )
}
