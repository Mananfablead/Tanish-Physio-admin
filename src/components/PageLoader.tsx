type PageLoaderProps = {
  text?: string;
};

export default function PageLoader({
  text = "Loading...",
}: PageLoaderProps) {
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-lg text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}
