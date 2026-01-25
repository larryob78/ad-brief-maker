import { Source } from '../types'

interface Props {
  sources: Source[]
  selectedSource: Source | null
  onSelect: (source: Source) => void
  onRefresh: () => void
}

function SourcePicker({ sources, selectedSource, onSelect, onRefresh }: Props) {
  const screens = sources.filter(s => s.id.startsWith('screen'))
  const windows = sources.filter(s => s.id.startsWith('window'))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-white font-medium">Select Source</h2>
        <button
          onClick={onRefresh}
          className="text-white/40 hover:text-white text-sm transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Screens */}
      {screens.length > 0 && (
        <div className="space-y-2">
          <span className="text-white/40 text-xs uppercase tracking-wide">Screens</span>
          <div className="grid grid-cols-2 gap-2">
            {screens.map((source) => (
              <SourceItem
                key={source.id}
                source={source}
                selected={selectedSource?.id === source.id}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      )}

      {/* Windows */}
      {windows.length > 0 && (
        <div className="space-y-2">
          <span className="text-white/40 text-xs uppercase tracking-wide">Windows</span>
          <div className="max-h-40 overflow-y-auto space-y-1">
            {windows.map((source) => (
              <WindowItem
                key={source.id}
                source={source}
                selected={selectedSource?.id === source.id}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

interface ItemProps {
  source: Source
  selected: boolean
  onSelect: (source: Source) => void
}

function SourceItem({ source, selected, onSelect }: ItemProps) {
  return (
    <button
      onClick={() => onSelect(source)}
      className={`relative rounded-lg overflow-hidden border-2 transition-all ${
        selected ? 'border-accent' : 'border-transparent hover:border-white/20'
      }`}
    >
      <img
        src={source.thumbnail}
        alt={source.name}
        className="w-full h-20 object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
      <span className="absolute bottom-1 left-2 right-2 text-white text-xs truncate">
        {source.name}
      </span>
    </button>
  )
}

function WindowItem({ source, selected, onSelect }: ItemProps) {
  return (
    <button
      onClick={() => onSelect(source)}
      className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all ${
        selected ? 'bg-accent/20 border border-accent' : 'bg-surface-light hover:bg-surface-light/80 border border-transparent'
      }`}
    >
      <img
        src={source.thumbnail}
        alt={source.name}
        className="w-10 h-10 rounded object-cover"
      />
      <span className="text-white text-sm truncate flex-1 text-left">
        {source.name}
      </span>
    </button>
  )
}

export default SourcePicker
