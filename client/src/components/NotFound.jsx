import { Navbar, Footer } from "./";

const NotFound = ({ userProfile, setUserProfile }) => {
  return (
    <main className="w-full min-h-screen flex flex-col justify-between items-center bg-dark-color-blue-background">
      <Navbar userProfile={userProfile} setUserProfile={setUserProfile} />
      <div className="flex flex-col items-center">
        <h1 className="text-[96px] text-white">404</h1>
        <h2 className="text-[48px] text-white">Page Not Found</h2>
      </div>

      <Footer />
    </main>
  );
};

export default NotFound;
