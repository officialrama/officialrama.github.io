import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Grid, Button, ButtonGroup, Fab, TextField } from '@material-ui/core';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { makeStyles, Theme } from '@material-ui/core/styles';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import AddIcon from '@material-ui/icons/Add';
import SearchIcon from '@material-ui/icons/Search';
import { getContactList} from '../api_service/apiService';

const useStyles = makeStyles(theme => ({
  root: {
    [theme.breakpoints.up('md')]: {
      marginBottom: theme.spacing(3)
    }
  },
  button: {
    [theme.breakpoints.down('sm')]: {
      margin: theme.spacing(1, 0)
    }
  },
  addIcon: {
    marginRight: theme.spacing(0.5)
  },
  fab: {
    margin: 0,
    top: 'auto',
    right: theme.spacing(3),
    bottom: theme.spacing(3),
    left: 'auto',
    position: 'fixed',
    zIndex: 99
  },
  link: {
    textDecoration: 'none'
  }
}));

interface ContactList {
    created_at: string;
    first_name: string;
    id: number;
    last_name: string;
    phones: { number: string }[];
    favorite: boolean;
  } 
  
interface MenuBarProps {
    filterMode: string;
    onFilterChange: (action: 'favorites' | 'all') => void;
  }
  
 
  const MenuBar: React.FC<MenuBarProps> = ({ filterMode, onFilterChange }) => {
    const classes = useStyles();
    const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));
    const [searchText, setSearchText] = useState('');
    const [searchResults, setSearchResults] = useState<ContactList[]>([]); 
  
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchText(event.target.value);
    };
  
    const handleSearchSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        try {
          const filteredContacts = await getContactList(0, 10, [{ id: 'asc' }], {
            last_name: {
              _like: `%${searchText}%`,
            },
          });
      
          setSearchResults(filteredContacts || []);
    
        } catch (error) {
          console.error('Error searching contact:', error);
        }
      };
  
    return (
      <Grid container className={classes.root}>
        <Grid container item xs={12} md={6} justify={isMobile ? 'center' : 'flex-start'}>
          <ButtonGroup fullWidth className={classes.button}>
            <Button
              disabled={filterMode === 'all'}
              onClick={() => onFilterChange('all')}
              color="primary"
              variant="contained"
            >
              ALL
            </Button>
            <Button
              disabled={filterMode === 'favorites'}
              color="primary"
              variant="contained"
              onClick={() => onFilterChange('favorites')}
            >
              MY FAVORITES
            </Button>
          </ButtonGroup>
        </Grid>
        <Grid container item md={6} justify={isMobile ? 'center' : 'flex-end'}>
          {isMobile ? (
            <Link to="/add" className={classes.link}>
              <Fab color="primary" aria-label="add" className={classes.fab}>
                <AddIcon />
              </Fab>
            </Link>
          ) : (
            <Link to="/add" className={classes.link}>
              <Button className={classes.button} variant="contained" color="primary">
                <AddCircleIcon className={classes.addIcon} /> New Contact
              </Button>
            </Link>
          )}
        </Grid>
        <Grid container item xs={12} md={6} justify={isMobile ? 'center' : 'flex-start'}>
        <TextField
          placeholder="Search"
          fullWidth
          variant="outlined"
          size="small"
          value={searchText}
          onChange={handleSearchChange}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              handleSearchSubmit(event);
            }
          }}
          InputProps={{
            endAdornment: (
              <SearchIcon onClick={handleSearchSubmit} style={{ cursor: 'pointer' }} />
            ),
          }}
        />
      </Grid>
      </Grid>
    );
  }
  
  export default MenuBar;
