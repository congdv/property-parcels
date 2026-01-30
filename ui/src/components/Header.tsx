import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useAuth } from 'react-oidc-context';

const Header: React.FC = () => {
  const auth = useAuth();

  console.log(auth)

  const handleLogin = () => {
    auth.signinRedirect();
  };

  const handleLogout = () => {
    auth.removeUser();
  };




  return (
    <AppBar position="static" sx={{ backgroundColor: '#6EC1E4', boxShadow: 'none' }}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: '#255963' }}>
          Property Parcels
        </Typography>
        {auth.isLoading ? null : auth.isAuthenticated ? (
          <>
            <Typography sx={{ color: '#255963', marginRight: 2, fontWeight: 500 }}>
              {auth.user?.profile.name}
            </Typography>
            <Button
              variant="contained"
              sx={{
                backgroundColor: '#fff',
                color: '#255963',
                borderRadius: '2em',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1.1rem',
                boxShadow: 'none',
                padding: '0.3em 1.5em',
                '&:hover': {
                  backgroundColor: '#e6f2f8',
                  boxShadow: 'none',
                },
              }}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </>
        ) : (
          <Button
            variant="contained"
            startIcon={<ArrowForwardIcon />}
            sx={{
              backgroundColor: '#fff',
              color: '#255963',
              borderRadius: '2em',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1.3rem',
              boxShadow: 'none',
              padding: '0.3em 1.5em',
              '&:hover': {
                backgroundColor: '#e6f2f8',
                boxShadow: 'none',
              },
            }}
            onClick={handleLogin}
          >
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
