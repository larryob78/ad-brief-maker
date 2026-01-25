function TitleBar() {
  return (
    <div className="flex items-center justify-between px-4 py-3 bg-surface-light/50">
      <div className="flex gap-2">
        <button
          onClick={() => window.electronAPI.closeWindow()}
          className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
        />
        <button
          onClick={() => window.electronAPI.minimizeWindow()}
          className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors"
        />
        <div className="w-3 h-3 rounded-full bg-green-500/30" />
      </div>
      <span className="text-white/40 text-xs font-medium">Desktop Recorder</span>
      <div className="w-14" />
    </div>
  )
}

export default TitleBar
