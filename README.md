# Post-life

## Описание

API для аналога живого журнала. Пока ещё в разработке, но что-то из задуманного можно увидеть по [этой ссылке](https://post-life.herokuapp.com/).
В качестве базы данных используется PostgreSQL, на бэкенде работает [Nest](https://github.com/nestjs/nest). Аватары, фото хранятся на [Cloudinary](http://cloudinary.com/), поэтому для установки необходимо записать в файл .env учётные данные _(см. ниже инструкцию)_ .

В этом проекте я не предполагаю разработку UI и если у кого-то будет желание сделать это я буду благодарен.

## Установка, настройка

```bash
$ npm install
```

В корневом каталоге проекта необходимо создать файл .env и там записать следующие значения:

**DATABASE_URL** - url подключения к базе данных (см. https://www.postgresql.org/docs/10/libpq-connect.html - **Connection URIs**)

**JWT_SECRET** - секретная фраза для создания токена

**MAIL_TRANSPORT** строка подключения к smtp-серверу для отправки почты _(см. https://nodemailer.com/smtp/)_

**MAIL_FROM_NAME** от чьего имени будет приходить почта. Например: MailBot

**URL_CONFIRM_ADDRESS** адрес, на который будет приходить пользователь для подтверждения подлинности почты _(см. ниже раздел про авторизацию)_

**CLOUDINARY_CLOUD_NAME** ,
**CLOUDINARY_API_KEY** ,
**CLOUDINARY_API_SECRET** , -
данные для доступа к сервису Cloudinary _(см. https://cloudinary.com/documentation/cloudinary_glossary#api_key_and_secret)_

_Пример:_

```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/database
JWT_SECRET=SuperSecretPassword
MAIL_TRANSPORT=smtps://useYandex@yandex.ru:password@smtp.yandex.ru
MAIL_FROM_NAME=WebWork
URL_CONFIRM_ADDRESS=http://localhost:3000/users/confirm/
CLOUDINARY_CLOUD_NAME=cloudinaryUser
CLOUDINARY_API_KEY=123456789123456
CLOUDINARY_API_SECRET=apiSecretPrase
```

## Запуск приложения

```bash
# development
$ npm run start

# production mode
$ npm run start:prod
```

## Авторизация

По задумке авторизация проходит в два этапа:

- Пользователь регистрируется на сайте, вводит свой эл. адрес и на почту ему приходит письмо с просьбой для завершения регистрации пройти по ссылке, которую написали в переменной **URL_CONFIRM_ADDRESS** и к этой ссылке добавляется некая фраза, которую необходимо отправить по адресу /api/users/confirm/_secret-phrase_ . После запроса пользователь получает статус "активен" и может оставлять записи; изменять свои данные и т.д.
