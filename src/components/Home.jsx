import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); // Clear token
    navigate('/login'); // Redirect to login
  };

  return (
    <div>
      <h2>Welcome to Community RideShare</h2>
      <button onClick={handleLogout}>Logout</button>
      <p>Placeholder for home screen content.</p>
    </div>
  );
}

export default Home;