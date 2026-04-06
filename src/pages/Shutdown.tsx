const Shutdown = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="space-y-4">
          <div className="text-6xl">🔥</div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Flintyo Has Shut Down
          </h1>
          <div className="w-16 h-0.5 bg-red-500/60 mx-auto" />
        </div>

        <div className="space-y-4 text-zinc-400 text-sm leading-relaxed">
          <p>
            Thank you for being part of the Flintyo community. After careful consideration, 
            we've made the difficult decision to shut down the platform.
          </p>
          <p>
            All user data — including accounts, Flints, debates, chats, and profiles — 
            has been permanently deleted.
          </p>
        </div>

        <div className="pt-4 border-t border-zinc-800">
          <p className="text-xs text-zinc-600">
            © 2025 Flintyo. Thank you for the memories.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Shutdown;
