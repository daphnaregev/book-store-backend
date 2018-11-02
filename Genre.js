const Genre = {
    SCIENCE_FICTION: 'Science fiction',
    SATIRE: 'Satire',
    DRAMA: 'Drama',
    ACTION: 'Action',
    ROMANCE: 'Romance',
    HORROR: 'Horror'
};
Object.freeze(Genre); // To make Genre an enum
module.exports = Genre;
