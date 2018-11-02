const Joi = require('joi');
const express = require('express');
const Genre = require('./Genre');
const StringUtils = require('./utils/StringUtils');
const app = express();

app.use(express.json());

app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With, content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

const books = [
    {
        id: StringUtils.generateGUID(),
        title: 'Hamlet',
        description: 'The tragedy of Hamlet',
        isbnNumber: 981094580945,
        author: 'William Shakespeare',
        publicationDate: '1603-10-21',
        genre: Genre.DRAMA,
        price: 85,
        color: StringUtils.getRandomBookCoverColor()
    }, {
        id: StringUtils.generateGUID(),
        title: 'Pride and Prejudice',
        description: 'Romantic Novel by Jane Austen',
        isbnNumber: 32904385093,
        author: 'Jane Austen',
        publicationDate: '1813-01-28',
        genre: Genre.ROMANCE,
        price: 65,
        color: StringUtils.getRandomBookCoverColor()
    }, {
        id: StringUtils.generateGUID(),
        title: 'Catcher in the Rye',
        description: 'Realistic adolescence Romance',
        isbnNumber: 982348972039,
        author: 'J.D. Salinger',
        publicationDate: '1951-07-16',
        genre: Genre.DRAMA,
        price: 35,
        color: StringUtils.getRandomBookCoverColor()
    }, {
        id: StringUtils.generateGUID(),
        title: 'It',
        description: 'Stephen King',
        isbnNumber: 908435098324,
        author: 'Stephen King',
        publicationDate: '1974-10-21',
        genre: Genre.ACTION,
        price: 50,
        color: StringUtils.getRandomBookCoverColor()
    }];

const validateBook = (book) => {
    const scheme = {
        id: Joi.string(),
        isbnNumber: Joi.number().integer().required(),
        publicationDate: Joi.string().min(5).required(),
        author: Joi.string().min(1).required(),
        title: Joi.string().min(1).required(),
        description: Joi.string(),
        price: Joi.number().required(),
        genre: Joi.string().valid(Object.values(Genre)),
    };
    return Joi.validate(book, scheme);
};

app.get('/api/books', (request, response) => {
    return response.status(200).send(JSON.stringify(books));
});

app.get('/api/books/:id', (request, response) => {
    const book = books.find(b => b.id === request.params.id);
    if (!book) {
        return request.status(404).send(JSON.stringify(`Book with given id ${request.params.id} was not found.`));
    }
    response.status(200).send(JSON.stringify(book));
});

app.delete('/api/books/:id', (request, response) => {
    const index = books.findIndex(b => b.id === request.params.id);
    if (index === -1) {
        return request.status(404).send(JSON.stringify(`Book with given id ${request.params.id} was not found.`));
    }

    const bookId = books[index].id;
    books.splice(index, 1);
    response.status(200).send(JSON.stringify(bookId));
});

app.post('/api/books', (request, response) => {
    const { error } = validateBook(request.body);
    if (error) {
        const errorMessage = error.details.map(d=>d.message).join(', ');
        return response.status(400).send(JSON.stringify(errorMessage));
    }

    const book = {
        id: StringUtils.generateGUID(),
        color: StringUtils.getRandomBookCoverColor(),
        isbnNumber: request.body.isbnNumber,
        publicationDate: request.body.publicationDate,
        author: request.body.author,
        title: request.body.title,
        description: request.body.description,
        genre: request.body.genre,
        price: request.body.price,
    };
    books.push(book);
    response.status(200).send(JSON.stringify(book));
});

app.put('/api/books/:id', (request, response) => {
    const bookId = request.params.id;
    const index = books.findIndex(b => b.id === bookId);
    if (index === -1) {
        return response.status(400).send(JSON.stringify(`Bad Request, book with id ${bookId} not found`));
    }

    const book = request.body;
    const { error } = validateBook(request.body);

    if (error) {
        const errorMessage = error.details.map(d=>d.message).join(', ');
        return response.status(400).send(JSON.stringify(errorMessage));
    }

    for (let field in book) {
        books[index][field] = book[field];
    }

    response.status(200).send(JSON.stringify(books[index]));
});

// PORT
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log('Listening on port ' + port);
});