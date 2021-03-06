import * as React from 'react';
import Modal from '@mui/material/Modal';
import Fade from '@mui/material/Fade';
import Backdrop from '@mui/material/Backdrop';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
// eslint-disable-next-line import/no-unresolved
import { LoadingButton } from '@mui/lab';
import { useEffect } from 'react';
import Checkbox from '@mui/material/Checkbox';
import { fetchProfileInfo } from '../../store/slices/userProfileSlice';
import { logIn, loginError, loginStart } from '../../store/slices/loginSlice';
import { restPost } from '../../api/instances/main';
import { setAlert } from '../../store/slices/alertSlice';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '68ch',
  maxHeight: '75vh',
  overflow: 'scroll',
  bgcolor: 'background.paper',
  boxShadow: 24,
  p: 4,
  '& .MuiTypography-root': { ml: 1, mb: 2 },
  '& .MuiTextField-root': { m: 1, width: '30ch', mb: 2 },
  '& .MuiCardActions-root': { ml: 2 },
};

const regExpCyrillic = new RegExp(/^[а-яА-Я]+$/);
const regExpCyrillicAndLatinic = new RegExp(/^[а-яА-Яa-zA-Z]+$/);
const regExpNumber = new RegExp(/^[0-9]{0,6}$/);
const regExpIndex = new RegExp(/^[0-9]{0,6}$/);
const regExpStreet = new RegExp(/^[а-яА-Я0-9-\s]{0,25}$/);
const regExpNumberHome = new RegExp(/^[0-9]+[а-яА-Я]?$/);
const regExpDistrict = new RegExp(/^[а-яА-Я]?[0-9]{0,2}$/);
const regExpPassword = new RegExp(/^[a-zA-Z0-9]{8,30}$/);
const regExpEmail = new RegExp(/^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[a-zA-Z0-9]{2,5}$/);

export default function Registered({ close, isOpen, toggleModal }) {
  const dispatch = useDispatch();
  const [login, setLogin] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [lastname, setLastname] = React.useState('');
  const [fatherName, setFatherName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [index, setIndex] = React.useState('');
  const [city, setCity] = React.useState('');
  const [street, setStreet] = React.useState('');
  const [numberHome, setNumberHome] = React.useState('');
  const [district, setDistrict] = React.useState('');
  const [numberRoom, setNumberRoom] = React.useState('');
  const [isCheck, setCheck] = React.useState(false);

  const submit = React.useCallback(() => {
    dispatch(loginStart());
    restPost('/api/profile/', {
      user_name: login,
      first_name: name,
      last_name: lastname,
      second_name: fatherName,
      e_mail: email,
      password_user: password,
      addr_index: index,
      addr_city: city,
      addr_street: street,
      addr_house: numberHome,
      addr_structure: district,
      addr_appart: numberRoom,
    }).then((response) => {
      if (response.status === 200) {
        restPost('/api/auth', { user_name: login, password_user: password })
          .then((_response) => {
            if (_response.status === 200) {
              dispatch(fetchProfileInfo(_response.data));
              dispatch(logIn(_response.data));
              close();
            } else {
              throw _response;
            }
          }).catch((error) => {
            dispatch(loginError(error));
          });
      } else {
        throw response;
      }
    }).catch((error) => {
      // eslint-disable-next-line no-underscore-dangle
      try {
        dispatch(setAlert({ text: JSON.parse(error.response.request.response).error, severity: 'error' }));
        dispatch(loginError(JSON.parse(error.response.request.response).error));
      } catch (e) {
        dispatch(setAlert({ text: 'Что-то пошло не так :(', severity: 'error' }));
        dispatch(loginError('Что-то пошло не так :('));
      }
    });
  }, [
    dispatch,
    logIn,
    close,
    login,
    password,
    name,
    lastname,
    fatherName,
    email,
    index,
    city,
    street,
    numberHome,
    district,
    numberRoom,
  ]);

  const [errors, setErrors] = React.useState({});

  const error = useSelector((state) => state.login.error);

  useEffect(() => {
    if (error) {
      const [field, text] = error?.message?.split?.(': ') || error?.split?.(': ') || [];

      let fieldName = '';

      switch (field) {
        case 'e_mail':
          fieldName = 'email';
          break;
        case 'user_name':
          fieldName = 'login';
          break;
        case 'first_name':
          fieldName = 'name';
          break;
        case 'last_name':
          fieldName = 'lastname';
          break;
        case 'password_user':
          fieldName = 'password';
          break;
        case 'addr_index':
          fieldName = 'index';
          break;
        case 'addr_city':
          fieldName = 'city';
          break;
        case 'addr_street':
          fieldName = 'street';
          break;
        case 'addr_house':
          fieldName = 'numberHome';
          break;
        case 'addr_structure':
          fieldName = 'district';
          break;
        case 'addr_appart':
          fieldName = 'numberRoom';
          break;
        default:
          dispatch(setAlert({ text: error, severity: 'error' }));
      }

      if (fieldName) {
        setErrors((prevState) => ({ ...prevState, [fieldName]: text }));
      }
    }
  }, [dispatch, error]);

  const isSubmit = login
    && password
    && name
    && lastname
    && email
    && index
    && city
    && street
    && numberHome
    && isCheck;

  const isLoading = useSelector((state) => state.login.isLoading);

  return (
    <Modal
      aria-labelledby="transition-modal-title"
      aria-describedby="transition-modal-description"
      open={isOpen}
      onClose={close}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={isOpen}>
        <Card
          sx={style}
          component="form"
          autoComplete="off"
        >
          <CardContent>
            <Typography variant="h5" component="div">
              Регистрация
            </Typography>
            <div
              style={{
                display: 'flex', borderBottom: 'solid gray 1px', paddingBottom: '8px', marginBottom: '8px',
              }}
            >
              <div>
                <TextField
                  required
                  error={errors?.name}
                  id="name"
                  label="Имя"
                  value={name}
                  sx={{ height: 68 }}
                  onChange={(e) => {
                    if (e.target.value.length > 25) {
                      setErrors((prevState) => ({ ...prevState, name: 'Ограничение 25 символов кириллицы' }));
                    } else if (!regExpCyrillic.test(e.target.value)) {
                      setErrors((prevState) => ({ ...prevState, name: 'Только буквы кириллицы' }));
                    } else {
                      setErrors((prevState) => ({ ...prevState, name: null }));
                    }

                    setName(e.target.value);
                  }}
                  helperText={errors?.name}
                />
                <TextField
                  required
                  error={errors?.lastname}
                  id="lastname"
                  label="Фамилия"
                  value={lastname}
                  sx={{ height: 68 }}
                  onChange={(e) => {
                    if (e.target.value.length > 25) {
                      setErrors((prevState) => ({ ...prevState, lastname: 'Ограничение 50 символов' }));
                    } else if (!regExpCyrillic.test(e.target.value)) {
                      setErrors((prevState) => ({ ...prevState, lastname: 'Только буквы кириллицы' }));
                    } else {
                      setErrors((prevState) => ({ ...prevState, lastname: null }));
                    }

                    setLastname(e.target.value);
                  }}
                  helperText={errors?.lastname}
                />
                <TextField
                  error={errors?.fatherName}
                  id="father-name"
                  label="Отчество"
                  value={fatherName}
                  sx={{ height: 68 }}
                  onChange={(e) => {
                    if (e.target.value.length > 25) {
                      setErrors((prevState) => ({ ...prevState, fatherName: 'Ограничение 25 символов' }));
                    } else if (!regExpCyrillic.test(e.target.value)) {
                      setErrors((prevState) => ({ ...prevState, fatherName: 'Только буквы кириллицы' }));
                    } else {
                      setErrors((prevState) => ({ ...prevState, fatherName: null }));
                    }

                    setFatherName(e.target.value);
                  }}
                  helperText={errors?.fathername}
                />
              </div>
              <div>
                <TextField
                  required
                  error={errors?.email}
                  id="email"
                  label="Email"
                  value={email}
                  sx={{ height: 68 }}
                  onChange={(e) => {
                    setErrors((prevState) => ({ ...prevState, email: null }));
                    setEmail(e.target.value);
                  }}
                  onBlur={(e) => {
                    if (!regExpEmail.test(e.target.value)) {
                      setErrors((prevState) => ({ ...prevState, email: 'нет @' }));
                    } else {
                      setErrors((prevState) => ({ ...prevState, email: null }));
                    }
                  }}
                  helperText={errors?.email}
                />
                <TextField
                  required
                  error={errors?.login}
                  id="login"
                  label="Логин"
                  value={login}
                  sx={{ height: 68 }}
                  onChange={(e) => {
                    if (e.target.value.length > 10) {
                      setErrors((prevState) => ({ ...prevState, login: 'Ограничение 10 символов' }));
                    } else if (!regExpCyrillicAndLatinic.test(e.target.value)) {
                      setErrors((prevState) => ({ ...prevState, login: 'Только буквы кириллицы и латинницы' }));
                    } else {
                      setErrors((prevState) => ({ ...prevState, login: null }));
                    }

                    setLogin(e.target.value);
                  }}
                  helperText={errors?.login}
                />
                <TextField
                  required
                  error={errors?.password}
                  id="password"
                  label="Пароль"
                  type="password"
                  value={password}
                  sx={{ height: 68 }}
                  onChange={(e) => {
                    if (e.target.value.length < 8) {
                      setErrors((prevState) => ({ ...prevState, password: 'Минимум 8 символов' }));
                    } else if (!regExpPassword.test(e.target.value)) {
                      setErrors((prevState) => ({
                        ...prevState,
                        password: 'Не меньше 8 символов, без спецсимволов',
                      }));
                    } else {
                      setErrors((prevState) => ({ ...prevState, password: null }));
                    }

                    setPassword(e.target.value);
                  }}
                  helperText={errors?.password}
                />
              </div>
            </div>
            <div style={{ display: 'flex' }}>
              <div>
                <TextField
                  required
                  error={errors?.index}
                  id="index"
                  label="Индекс"
                  value={index}
                  sx={{ height: 68 }}
                  onChange={(e) => {
                    if (e.target.value.length > 6) {
                      setErrors((prevState) => ({ ...prevState, index: 'Ограничение 6 цифр' }));
                    } else if (!regExpIndex.test(e.target.value)) {
                      setErrors((prevState) => ({ ...prevState, index: 'Только цифры' }));
                    } else {
                      setErrors((prevState) => ({ ...prevState, index: null }));
                    }

                    if (e.target.value.length <= 6) {
                      setIndex(e.target.value);
                    }
                  }}
                  helperText={errors?.index}
                />
                <TextField
                  required
                  error={errors?.city}
                  id="city"
                  label="Город"
                  value={city}
                  sx={{ height: 68 }}
                  onChange={(e) => {
                    if (e.target.value.length > 15) {
                      setErrors((prevState) => ({ ...prevState, city: 'Ограничение 15 символов' }));
                    } else if (!regExpCyrillic.test(e.target.value)) {
                      setErrors((prevState) => ({ ...prevState, city: 'Только буквы кириллицы' }));
                    } else {
                      setErrors((prevState) => ({ ...prevState, city: null }));
                    }

                    setCity(e.target.value);
                  }}
                  helperText={errors?.city}
                />
                <TextField
                  required
                  error={errors?.street}
                  id="street"
                  label="Улица"
                  value={street}
                  sx={{ height: 68 }}
                  onChange={(e) => {
                    if (e.target.value.length > 15) {
                      setErrors((prevState) => ({ ...prevState, street: 'Ограничение 25 символов' }));
                    } else if (!regExpStreet.test(e.target.value)) {
                      setErrors((prevState) => ({ ...prevState, street: 'Только цифры ,буквы кириллицы и знак - ' }));
                    } else {
                      setErrors((prevState) => ({ ...prevState, street: null }));
                    }

                    setStreet(e.target.value);
                  }}
                  helperText={errors?.city}
                />
              </div>
              <div>
                <TextField
                  required
                  error={errors?.numberHome}
                  id="number-home"
                  label="Номер дома"
                  value={numberHome}
                  sx={{ height: 68 }}
                  onChange={(e) => {
                    if (e.target.value.length > 5) {
                      setErrors((prevState) => ({ ...prevState, numberHome: 'Ограничение в 5 символов' }));
                    } else if (!regExpNumberHome.test(e.target.value)) {
                      setErrors((prevState) => ({ ...prevState, numberHome: 'Только цифры, и 1 буква' }));
                    } else {
                      setErrors((prevState) => ({ ...prevState, numberHome: null }));
                    }

                    setNumberHome(e.target.value);
                  }}
                  helperText={errors?.numberHome}
                />
                <TextField
                  error={errors?.district}
                  id="district"
                  label="Номер строения"
                  value={district}
                  sx={{ height: 68 }}
                  onChange={(e) => {
                    if (e.target.value.length > 5) {
                      setErrors((prevState) => ({ ...prevState, district: 'буква или число до 2 знаков' }));
                    } else if (!regExpDistrict.test(e.target.value)) {
                      setErrors((prevState) => ({ ...prevState, district: 'буква или число до 2 знаков' }));
                    } else {
                      setErrors((prevState) => ({ ...prevState, district: null }));
                    }

                    setDistrict(e.target.value);
                  }}
                  helperText={errors?.district}
                />
                <TextField
                  error={errors?.numberRoom}
                  id="number-room"
                  label="Номер квартиры"
                  value={numberRoom}
                  sx={{ height: 68 }}
                  onChange={(e) => {
                    if (e.target.value.length > 3) {
                      setErrors((prevState) => ({ ...prevState, numberRoom: 'Ограничение 3 символа' }));
                    } else if (!regExpNumber.test(e.target.value)) {
                      setErrors((prevState) => ({ ...prevState, numberRoom: 'Только цифры' }));
                    } else {
                      setErrors((prevState) => ({ ...prevState, numberRoom: null }));
                    }

                    setNumberRoom(e.target.value);
                  }}
                  helperText={errors?.numberRoom}
                />
              </div>
            </div>
            <Checkbox
              checked={isCheck}
              onChange={() => {
                setCheck((prev) => !prev);
              }}
            />
            <span style={{ paddingLeft: '8px', fontSize: '12px' }}>
              Нажимая эту кнопку, вы подтверждаете... и  даёте согласие...
            </span>

          </CardContent>
          <CardActions>
            <LoadingButton
              size="small"
              variant="contained"
              onClick={submit}
              disabled={!isSubmit}
              loading={isLoading}
            >
              Регистрация
            </LoadingButton>
            <Button size="small" onClick={toggleModal}>Войти</Button>
          </CardActions>
        </Card>
      </Fade>
    </Modal>
  );
}

Registered.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  close: PropTypes.func.isRequired,
  toggleModal: PropTypes.func.isRequired,
};
