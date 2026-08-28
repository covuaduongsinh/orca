import { CheckCircle2, Cloud, Unlink } from 'lucide-react'
import { Button } from '../ui/button'
import { Label } from '../ui/label'
import { translate } from '@/i18n/i18n'

type GroqTranscriptionSettingsRowProps = {
  configured: boolean
  disabled: boolean
  onConfigure: () => void
  onClear: () => void
}

export function GroqTranscriptionSettingsRow({
  configured,
  disabled,
  onConfigure,
  onClear
}: GroqTranscriptionSettingsRowProps): React.JSX.Element {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="min-w-0 space-y-0.5">
        <div className="flex items-center gap-2">
          <Cloud className="size-4 shrink-0 text-muted-foreground" />
          <Label>
            {translate(
              'auto.components.settings.GroqTranscriptionSettingsRow.27e0cb656d',
              'Groq Transcription'
            )}
          </Label>
          {configured && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <CheckCircle2 className="size-3.5" />
              {translate(
                'auto.components.settings.GroqTranscriptionSettingsRow.3b0ab3fc0b',
                'Connected'
              )}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {configured
            ? translate(
                'auto.components.settings.GroqTranscriptionSettingsRow.b59b9b2b51',
                'API key configured for cloud speech-to-text models.'
              )
            : translate(
                'auto.components.settings.GroqTranscriptionSettingsRow.893790e13b',
                'Add an Groq API key before selecting cloud speech-to-text models.'
              )}
        </p>
      </div>
      {configured ? (
        <div className="flex shrink-0 items-center gap-1.5">
          <Button variant="outline" size="sm" disabled={disabled} onClick={onConfigure}>
            {translate(
              'auto.components.settings.GroqTranscriptionSettingsRow.a622bc3b37',
              'Replace key'
            )}
          </Button>
          <button
            onClick={onClear}
            aria-label={translate(
              'auto.components.settings.GroqTranscriptionSettingsRow.ae2df8f511',
              'Disconnect Groq API key'
            )}
            disabled={disabled}
            className="rounded-md p-1 text-muted-foreground/50 transition-colors hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Unlink className="size-3.5" />
          </button>
        </div>
      ) : (
        <Button variant="outline" size="sm" disabled={disabled} onClick={onConfigure}>
          {translate(
            'auto.components.settings.GroqTranscriptionSettingsRow.85c589cd61',
            'Add API key'
          )}
        </Button>
      )}
    </div>
  )
}
