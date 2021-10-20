/* eslint-disable no-duplicate-case */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable import/no-unresolved */
/* eslint-disable no-unused-vars */
import { makeStyles } from '@material-ui/styles';
import React, { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Input from 'components/Input/Input';
import { useForm } from 'react-hook-form';
import { useSelector, useDispatch } from 'react-redux';
import { restPost, restGet } from 'api/instances/main';

const useStyle = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  container: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  btn: {
    margin: '15px',
  },
});

const ActiveOffers = () => {
  const userId = useSelector(((state) => state.login.userId));
  const style = useStyle();
  const [step, setStep] = useState(1);
  const [masOfIdExchange, setMasOfIdExchange] = useState([]);
  const [exchange, setExchange] = useState([]);
  const [isAcceptUserStepOne, setIsAcceptUserStepOne] = useState(false);
  const [isAcceptUserStepTwo, setIsAcceptUserStepTwo] = useState(false);
  const [isAcceptUserStepThree, setIsAcceptUserStepThree] = useState(false);
  const [isAcceptContrUserStepOne, setIsAcceptContrUserStepOne] = useState(false);
  const [isAcceptContrUserStepTwo, setIsAcceptContrUserStepTwo] = useState(false);
  const [isAcceptContrUserStepThree, setIsAcceptContrUserStepThree] = useState(false);
  // TODO надо добавить изменения шагов контр-агента после доработки бэка
  // switch (exchange?.OtherBook?.StatusText) {
  //   case 'Подтверждена. Ожидает трек-номера':
  //     setIsAcceptContrUserStepOne(true);
  //     break;
  //   case 'Книга доставляется. Ожидаем трек-номер':
  //     setIsAcceptContrUserStepTwo(true);
  //     break;
  //   case `Книга ${'dsadsa'} доставлена`:
  //     setIsAcceptContrUserStepThree(false);
  //     break;
  //   default:
  //     break;
  // }

  // (async () => {
  // await restGet(`/api/exchange/${userId}/all`);
  // })();
  const propsFrom = useForm();
  const {
    handleSubmit, control,
  } = propsFrom;
  const formValues = propsFrom?.getValues();
  // получение  id активных обменов
  useEffect(() => {
    restGet(`/api/exchange/${userId}/all`)
      .then(({ data }) => {
        setMasOfIdExchange(data);
      })
      .catch((err) => alert(`Не удалось загрузить список, ${err.message}`));
  }, []);
  if (!masOfIdExchange?.length) {
    return (<p>У вас нет активного обмена</p>);
  }
  // получение конкретного обмена
  useEffect(() => {
    restGet(`/api/exchange/${userId}/${'exchangeId'}`)
      .then(({ data }) => setExchange(data))
      .catch((err) => alert(`Не удалось получить активный обмен ${err.message}`));
  }, [masOfIdExchange]);
  // отпарвка трек номера
  const onSubmitForm = () => {
    console.log(formValues);
    restPost(`/api/exchange/send/${userId}/${'exchangeId'}`, formValues) // надо изменить на exchangeId
      .then(() => {
        setIsAcceptUserStepTwo(true);
        restGet(`/api/exchange/${userId}/${'exchangeId'}`)
          .then(({ data }) => setExchange(data))
          .catch((err) => alert(`Не удалось получить статус обмена ${err.message}`));
        if (isAcceptContrUserStepTwo) {
          setStep((prev) => prev + 1);
        }
      })
      .catch((err) => {
        alert(`Ошибка при отправки данных, попробуйте позже ${err.message}`);
      });
  };

  return (
    <div className={style.root}>
      <p>Карточка обмена</p>
      <div className={style.container}>
        <Card
          elevation={4}
          sx={{
            width: 370,
            minHeight: 400,
            m: 2,
          }}
        >
          <CardContent>
            <Typography align="center" variant="h6" component="div">
              Мне
            </Typography>
            <br />
            <Typography align="center" variant="body2">
              Тут должна быть хотелка какая-то
              {exchange?.OtherBook?.BookName}
              {exchange?.OtherBook?.Note}
              {exchange?.OtherBook?.AuthorFirstName}
              {exchange?.OtherBook?.AuthorLastName}
            </Typography>
            <br />
            <br />
            <br />
            <br />
            <Typography align="center" variant="body2">
              {isAcceptContrUserStepOne && <p>Обмен подтвержден</p> }
              {!isAcceptContrUserStepOne && <p>Обмен не подтвержден</p> }
              <br />
              {isAcceptContrUserStepTwo && step === 2 && (
                <>
                  <p>Номер отправления</p>
                  <p>1234567891011</p>
                </>
              )}
              {!isAcceptContrUserStepTwo && step === 2 && (
                <p>Книга пока не отправлена</p>
              )}
              {isAcceptContrUserStepThree && step === 3 && (
                <p>Книга получена</p>
              )}
              {!isAcceptContrUserStepThree && step === 3 && (
                <p>Книга не получена</p>
              )}
            </Typography>
          </CardContent>
        </Card>
        <Card
          elevation={4}
          sx={{
            width: 370,
            minHeight: 400,
            m: 2,
          }}
        >
          <CardContent>
            <Typography align="center" variant="h6" component="div">
              Я
            </Typography>
            <br />
            <Typography align="center" variant="body2">
              Здесь то что пользователь будет менять:
              {exchange?.MyBook?.BookName}
              {exchange?.MyBook?.Note}
              {exchange?.MyBook?.AuthorFirstName}
              {exchange?.MyBook?.AuthorLastName}
            </Typography>
            <br />
            <br />
            <br />
            <br />
            <Typography align="center" variant="body2">
              {isAcceptUserStepOne && <p>Обмен подтвержден</p>}
              <br />
              {!isAcceptUserStepOne
              && step === 1 && (
              <Button
                variant="contained"
                // здесь отправка подтверждения обмена
                onClick={() => {
                  restPost(`/api/exchange/agree/${userId}/${'exchangeId'}`) // здесь надо менять на Id обмена
                    .then(async () => {
                      setIsAcceptUserStepOne(true);
                      await restGet(`/api/exchange/${userId}/${'exchangeId'}`) // здесь надо менять на Id обмена
                        .then(({ data }) => setExchange(data))
                        .catch((err) => alert(`Не удалось получить активный обмен ${err.message}`));
                      if (isAcceptContrUserStepOne) {
                        setStep((prev) => prev + 1);
                      }
                    })
                    .catch((err) => alert('Не удалось подтвердить обмен'));
                }}
                size="small"
              >
                Подтвердить
              </Button>
              )}
              {!isAcceptUserStepTwo && step === 2
              && (
              // здесь отправка трек номера
              <form
                onSubmit={(event) => { handleSubmit(onSubmitForm)(event); }}
                className={style.root}
              >
                <Input
                  rules={
                  {
                    required: {
                      value: true,
                      message: 'Поле обязательно',
                    },
                    maxLength: {
                      value: 14,
                      message: 'Не больше 14-ти символов',
                    },
                    minLength: {
                      value: 14,
                      message: 'Не менее 14-ти символов',
                    },
                    pattern: {
                      value: /^[0-9]+$/,
                      message: 'Только цифры',
                    },
                  }
                }
                  control={control}
                  label="Номер отправления*"
                  name="number_order"
                />
                <Button
                  className={style.btn}
                  variant="contained"
                  type="submit"
                >
                  Отправил
                </Button>
              </form>
              )}
              {isAcceptUserStepTwo && step === 2 && (
              <>
                <p>Номер отправления</p>
                <p>1234567891011</p>
              </>
              )}
              {!isAcceptUserStepThree && step === 3 && (
              <>
                <p>Номер отправления</p>
                <p>1234567891011</p>
                <Button
                  className={style.btn}
                  variant="contained"
                  onClick={() => {
                    restPost(`/api/exchange/receive/${userId}/${'exchangeId'}`) // exchangeId надо менять
                      .then(() => {
                        setIsAcceptUserStepThree(true);
                      })
                      .catch((err) => alert(`Не удалось подтвердить получение, попробуйте позже ${err.message}`));
                  }}
                >
                  Поулчил
                </Button>
              </>
              )}
              {isAcceptUserStepThree && step === 3 && (
                <p>Книга получена</p>
              )}
            </Typography>
          </CardContent>
          {/* <CardActions style={{ justifyContent: 'center' }} /> */}
        </Card>
      </div>
      <Button
        variant="contained"
        onClick={() => {
          restGet(`/api/exchange/${userId}/${[...masOfIdExchange]}`) // здесь надо менять на Id обмена
            .then(({ data }) => setExchange(data))
            .catch((err) => alert(`Не удалось получить активный обмен ${err.message}`));
        }}
      >
        Обновить статус обмена
      </Button>
    </div>
  );
};
export default ActiveOffers;
