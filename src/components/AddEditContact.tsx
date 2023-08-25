import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  Grid,
  Typography,
  Button,
  TextField,
  FormControlLabel,
  Checkbox,
  Paper
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import {
  getContactBySlug,
  upsertContact as upsertLocalContact,
  deleteContactBySlug as deleteLocalContact
} from '../storage';
import { slugify } from '../utils';
import { getContactDetail, createdContact, updateContact, deleteContact } from '../api_service/apiService';
// import Footer from './Footer';

// Using W3C regexp available on https://emailregex.com/
const emailRegex = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

// Reference: https://regexr.com/3c53v
// eslint-disable-next-line
const telephoneRegex = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/;

const useStyles = makeStyles(theme => ({
  root: {
    padding: theme.spacing(8),
    [theme.breakpoints.down('sm')]: {
      padding: theme.spacing(2)
    }
  },
  field: {
    margin: theme.spacing(1, 0)
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

interface Contact {
  id: number;
  name: string;
  email: string;
  telephone: string;
  favorite: boolean;
  slug: string;
}

interface AddEditContactProps {
    match?: {
      params: {
        name: string;
      };
    };
  }
  
  function AddEditContact({ match }: AddEditContactProps): JSX.Element {
    function validateRequired(value: string): boolean {
        return typeof value === 'string' && value.trim() !== '';
      }
    const location = useLocation();
   const isAddMode = location.pathname.includes('/add'); 
   const [phoneValues, setPhoneValues] = useState<string[]>(['', '']);
    const { id } = useParams();
    // const initialId = window.location.href.split('/');
    const [values, setValues] = useState<ContactList>({
      created_at: '',
      first_name: '',
      id: Number(id),
      last_name: '',
      phones: [{ number: '' }, { number: '' }],
      favorite: true,
    });

   
  
    useEffect(() => {
      async function fetchContactDetail() {
        try {
          const contactDetail = await getContactDetail(Number(id));
          if (contactDetail) {
            setValues(contactDetail);
          }
        } catch (error) {
          console.error('Error fetching contact details:', error);
        }
      }
      fetchContactDetail();
    }, []);
   
    const [saved, setSaved] = useState(false);
  
    const classes = useStyles();
    const navigate = useNavigate();
  
    // useEffect(() => {
    //   if (!isAddMode && !getContactBySlug(match?.params.name)) {
    //     navigate('/');
    //   }
    // }, [isAddMode, match?.params.name, navigate]);
  
    const handleChange = (name: keyof ContactList, index?: number) => (
        event: React.ChangeEvent<HTMLInputElement>
      ) => {
        if (index !== undefined && telephoneRegex.test(event.target.value)) {
          const newPhones = [...values.phones];
          newPhones[index].number = event.target.value;
          setValues({ ...values, phones: newPhones });
        } else {
            if (name === 'first_name' || name === 'last_name') {
              const newValue = event.target.value.replace(/[^a-zA-Z\s]/g, '');
              setValues({ ...values, [name]: newValue });
            }
        }
      };
  
    const handleCheckbox = (name: keyof ContactList) => (
      event: React.ChangeEvent<HTMLInputElement>
    ) => {
      setValues({ ...values, [name]: event.target.checked });
    };
  
    const isFormValid = (): boolean => {
      const { first_name } = values;
      return validateRequired(first_name) && isNameValid();
    };
    
  
    const isNameValid = () => {
      const slug = slugify(values.first_name);
      const savedContact = getContactBySlug(slug);
      if (isAddMode) {
        return !savedContact;
      } else {
        return !savedContact || slug === match?.params.name;
      }
    };
  
    const handlePhoneChange = (index: number) => (
        event: React.ChangeEvent<HTMLInputElement>
      ) => {
        const newPhoneValues = [...phoneValues];
        newPhoneValues[index] = event.target.value;
        setPhoneValues(newPhoneValues);
      };
  
      const saveContact = async () => {
        const slug = slugify(values.first_name);
        const contactData = {
          first_name: values.first_name,
          last_name: values.last_name,
          phones: values.phones.map(phone => ({ number: phone.number })),
          favorite: values.favorite,
          id: values.id, 
          created_at: values.created_at,
        };
      
        try {
          if (isAddMode) {
            await createdContact(contactData);
          } else {
            await updateContactDetails(contactData);
          }
          setSaved(true);
        } catch (error) {
          console.error('Error saving contact:', error);
        }
      };
    
      const updateContactDetails = async (contactData: ContactList) => {
        try {
          const updatedContact = await updateContact(Number(id), contactData);
          if (updatedContact) {
            setValues(updatedContact);
          }
        } catch (error) {
          console.error('Error updating contact:', error);
        }
      };
    
      if (saved) {
        window.location.href = '/';
      }
   
   

  return (
    <Grid container>
      <Grid item xs={12}>
        <Typography variant="h1">
          {isAddMode ? 'Add new contact' : 'Edit contact'}
        </Typography>
      </Grid>
      <Paper className={classes.root}>
        <form noValidate>
          <Grid container>
            <Grid item xs={12}>
              <TextField
                label="First Name"
                value={values.first_name}
                onChange={handleChange('first_name')}
                variant="outlined"
                fullWidth
                required
                error={!isNameValid()}
                helperText={!isNameValid() && 'This contact already exists.'}
                className={classes.field}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Last Name"
                value={values.last_name}
                onChange={handleChange('last_name')}
                variant="outlined"
                fullWidth
                required
                className={classes.field}
              />
            </Grid>
            <Grid item xs={12}>
            <TextField
            label="Telephone 1"
            value={values.phones[0]?.number || ''}
            onChange={handleChange('phones', 0)}
            variant="outlined"
            type="tel"
            fullWidth
            disabled={!isAddMode}
            className={classes.field}
            />
            </Grid>
            <Grid item xs={12}>
            <TextField
            label="Telephone 2"
            value={values.phones[1]?.number || ''}
            onChange={handleChange('phones', 1)}
            variant="outlined"
            type="tel"
            fullWidth
            disabled={!isAddMode}
            className={classes.field}
            />
        </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    color="primary"
                    checked={values.favorite}
                    onChange={handleCheckbox('favorite')}
                    value="favorite"
                  />
                }
                label="Is it a favorite contact?"
                className={classes.field}
              />
            </Grid>
            <Grid container item xs={12} spacing={1}>
              <Grid item>
                <Link to="/" className={classes.link}>
                  <Button variant="outlined">Cancel</Button>
                </Link>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  disabled={!isFormValid()}
                  onClick={saveContact}
                  color="primary"
                >
                  Save
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </form>
      </Paper>
      {/* <Footer /> */}
    </Grid>
  );
}

export default AddEditContact;
