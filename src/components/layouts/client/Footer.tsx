export const Footer = () => {
    return (
      <footer className="border-t py-6">
        <div className="container px-4">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} SwiftTrack. All rights reserved.
          </p>
        </div>
      </footer>
    );
  };