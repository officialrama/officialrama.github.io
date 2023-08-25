import React, { useState, useEffect } from 'react';
import { Grid, Typography, Paper, TablePagination } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import {
  getContacts,
  getContactBySlug,
  upsertContact,
  deleteContactBySlug
} from '../storage';
import ContactsList from './ContactsList';
import ContactsTable from './ContactsTable';
import SuccessMessage from './SuccessMessage';
import MenuBar from './MenuBar';
import { getContactList, deleteContact } from '../api_service/apiService';
import { useDispatch } from 'react-redux';

const useStyles = makeStyles(theme => ({
  root: {
    marginBottom: theme.spacing(1),
    padding: theme.spacing(8),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2)
    }
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

interface Contact {
  id: number;
  name: string;
  email: string;
  telephone: string;
  favorite: boolean;
  slug: string;
}

interface SuccessMessageProps {
  message: string | null;
  onClose: () => void;
}



function ContactListing(): JSX.Element {
  const [contactsShow, setContactsShow] = useState<ContactList[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'favorites'>('all');
  const [offset, setOffset] = useState(0);
  const [totalContactCount, setTotalContactCount] = useState(0);
  const limit = 10; 
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    setOffset(newPage * limit); 
  };
  
  useEffect(() => {
  async function fetchContactList() {
    try {
      const contactList = await getContactList(
        offset,
        limit,
        { created_at: 'desc' },
        {}
      );
      
      if (contactList) {
        const updatedContactList = contactList.map(contact => ({
          ...contact,
          favorite: false 
        }));
        setContactsShow(updatedContactList);
      } else {
        console.error('Contact list is null');
      }
    } catch (error) {
      console.error('Error fetching contact list:', error);
    }
  }
  fetchContactList();
    }, [offset, limit]);


const toggleFavorite = (id: number, first_name: string) => {
  const updatedContacts = contactsShow.map(contact => {
    if (contact.id === id) {
      return {
        ...contact,
        favorite: !contact.favorite
      };
    }
    return contact;
  });
  setContactsShow(updatedContacts);

  const message = updatedContacts.find(contact => contact.id === id)?.favorite
    ? `${first_name} is a favorite contact now!`
    : `${first_name} isn't a favorite contact now!`;
  setSuccessMessage(message);
};

  const getFilteredContacts = (): ContactList[] => {
    if (filterMode === 'all') {
      return contactsShow.filter(contact => !contact.favorite);
    }

    if (filterMode === 'favorites') {
      return contactsShow.filter(contact => contact.favorite);
    }

    return [];
  };
    

  const classes = useStyles();
  const contacts = getFilteredContacts();
  const RenderContacts = isMobile ? ContactsList : ContactsTable;

  

  return (
    <Paper className={classes.root}>
      {successMessage && (
        <SuccessMessage
          message={successMessage}
          onClose={() => setSuccessMessage(null)}
        />
      )}
      <Grid container>
        <Grid item xs={12}>
          <MenuBar filterMode={filterMode} onFilterChange={setFilterMode} />
        </Grid>
        <Grid item xs={12}>
        {contactsShow.length === 0 ? (
            <Typography>No contacts available.</Typography>
          ) : (
            <React.Fragment>
              <RenderContacts
                data={contacts}
                toggleFavorite={toggleFavorite}
                deleteContact={deleteContact}
              />
              <TablePagination
                component="div"
                count={contactsShow.length}
                page={offset/limit} 
                onPageChange={(event, newPage) => setOffset(newPage * limit)}
                rowsPerPage={limit}
                onRowsPerPageChange={() => {}}
              />
            </React.Fragment>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
}

interface ContactsProps {
  dataUser?: ContactList;  
//   toggleFavorite: (e: React.MouseEvent, first_name: string) => void;
  // children: React.ReactNode;
}
function Contacts({dataUser}: ContactsProps): JSX.Element {

  return (
    <Grid container>
      <Grid item xs={12}>
        <Typography variant="h1">Contact App</Typography>
      </Grid>
      <Grid item xs={12}>
        <ContactListing />
      </Grid>
      {/* <Footer /> */}
    </Grid>
  );
}

export default Contacts;
