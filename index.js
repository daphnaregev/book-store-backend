const Joi = require('joi');
const express = require('express');
const Genre = require('./Genre');
const StringUtils = require('./utils/StringUtils');
const app = express();

app.use(express.json());

const books = [
    {
        id: StringUtils.generateGUID(),
        title: 'Hamlet',
        description: 'Hamlet book',
        isbnNumber: 981094580945,
        author: 'William Shakespeare',
        publicationDate: '2018-10-21',
        genre: Genre.ROMANCE,
        price: 20,
        color: StringUtils.getRandomBookCoverColor()
    }, {
        id: StringUtils.generateGUID(),
        title: 'Pride and Prejudice',
        description: '',
        isbnNumber: 1234,
        author: 'Jane Austen',
        publicationDate: '2018-10-21',
        genre: Genre.ROMANCE,
        price: 45,
        color: StringUtils.getRandomBookCoverColor()
    }, {
        id: StringUtils.generateGUID(),
        title: 'Catcher in the Rye',
        description: 'b',
        isbnNumber: 1234,
        author: 'J.D. Salinger',
        publicationDate: '2018-10-21',
        genre: Genre.DRAMA,
        price: 35,
        color: StringUtils.getRandomBookCoverColor()
    },
    {
        id: StringUtils.generateGUID(),
        title: 'It',
        description: 'Stephen King',
        isbnNumber: 1234,
        author: 'Stephen King',
        publicationDate: '2018-10-21',
        genre: Genre.ACTION,
        price: 200,
        color: StringUtils.getRandomBookCoverColor()
    }
    ];

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

app.get('/api/books', (request, response) => {
    response.status(200).send(JSON.stringify(books));
    return;
});

app.get('/api/books/:id', (request, response) => {
    const book = books.find(b => b.id === request.params.id);
    if (!book) {
        request.status(404).send(JSON.stringify(`Book with given id ${request.params.id} was not found.`));
        return;
    }
    response.status(200).send(JSON.stringify(book));
    return;
});

app.delete('/api/books/:id', (request, response) => {
    const index = books.findIndex(b => b.id === request.params.id);
    if (index === -1) {
        request.status(404).send(JSON.stringify(`Book with given id ${request.params.id} was not found.`));
        return;
    } else {
        const bookId = books[index].id;
        books.splice(index, 1);
        response.status(200).send(JSON.stringify(bookId));
        return;
    }
});

app.post('/api/books', (request, response) => {
    try {
        const scheme = {
            isbnNumber: Joi.number().integer().required(),
            publicationDate: Joi.string().min(5).required(),
            author: Joi.string().min(1).required(),
            title: Joi.string().min(1).required(),
            description: Joi.string(),
            price: Joi.number().required(),
            genre: Joi.string().valid(Object.values(Genre)),
        };
        const result = Joi.validate(request.body, scheme);

        if (result.error) {
            const errorMessage = result.error.details.map(d=>d.message).join(', ');
            response.status(400).send(JSON.stringify(errorMessage));
            return;
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

    } catch(e) {
        response.status(500).send(JSON.stringify(`Internal Server Error - exception occurred: ${e}`))

    }
});

app.put('/api/books/:id', (request, response) => {
    try {
        const bookId = request.params.id;
        const index = books.findIndex(b => b.id === bookId);
        if (index === -1) {
            response.status(400).send(JSON.stringify(`Bad Request, book with id ${bookId} not found`));
            return;
        }

        const book = request.body;

        if (typeof (book.isbnNumber) !== 'number') {
            book.isbnNumber = parseInt(book.isbnNumber);
        }
        if (typeof (book.price) !== 'number') {
            book.price = parseFloat(book.price);
        }

        for (let field in book) {
            books[index][field] = book[field];
        }

        response.status(200).send(JSON.stringify(books[index]));
        return;
    } catch(e) {
        response.status(500).send(JSON.stringify(`Internal Server Error - exception occurred: ${e}`))
        return;
    }
});


// PORT
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log('Listening on port ' + port);
});