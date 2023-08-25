import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Typography } from '@material-ui/core';

function NotFound() {
  const [redirectToHome, setRedirectToHome] = React.useState(false);
  const navigate = useNavigate();
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setRedirectToHome(true);
    }, 10000);
    return () => clearTimeout(timer);
  });
  if (redirectToHome){
    navigate("/")
  }

  return (
    <Grid container>
      <Grid item xs={12}>
        <Typography variant="h1">Page not found</Typography>
        <Typography variant="h2">
          Going to redirect to home in 10 seconds
        </Typography>
      </Grid>
    </Grid>
  );
}

export default NotFound;
