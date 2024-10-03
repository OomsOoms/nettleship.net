const MainLayout = ({ children }) => {
    return (
        <div className="main-layout">
            <header>Header Content</header>
            <main>{children}</main>
            <footer>Footer Content</footer>
        </div>
    );
};

export default MainLayout;