import React from 'react';
import ReactDOM from 'react-dom';
import './styles.css';

function App() {
    return (
        <div className="App">
            <NavBar />
            <Header />
            <Content />
            <Footer />
        </div>
    );
}

function NavBar() {
    return (
        <nav className="navbar">
            <ul>
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#services">Services</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    );
}

function Header() {
    return (
        <header className="header">
            <h1>Community Ridesharing Application</h1>
        </header>
    );
}

function Content() {
    return (
        <main className="content">
            <p>Welcome to the Community Ridesharing Application. This is a placeholder content.</p>
        </main>
    );
}

function Footer() {
    return (
        <footer className="footer">
            <p>&copy; 2025 Community Ridesharing</p>
        </footer>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));