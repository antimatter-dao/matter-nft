import Button from './Button'
import OutlineButton from './OutlineButton'
import Spinner from 'components/Spinner'
import { Text } from 'rebass'

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
  onAction: () => void
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
        <OutlineButton primary disabled height={height} width={width}>
          {pending ? (
            <>
              <Spinner marginRight={16} />
              {pendingText || 'Waiting Confirmation'}
            </>
          ) : (
            error
          )}
        </OutlineButton>
      ) : success ? (
        <OutlineButton disabled height={height} width={width} primary>
          <Text>{successText ?? actionText}</Text>
        </OutlineButton>
      ) : (
        <Button height={height} width={width} onClick={onAction} disabled={disableAction}>
          {actionText}
        </Button>
      )}
    </>
  )
}
