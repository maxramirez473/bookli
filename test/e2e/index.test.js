const fixture = require('../../scripts/fixture.js');
const startServer = require('../../server/src/index.js');
const BookModels = require('../../server/src/models/book.js');

let BASE_URL;
let server;

before(async (browser, done) => {
    server = await startServer();

    BASE_URL = `http://localhost:${server.address().port}`;
    done();
});

beforeEach(async (browser, done) => {
    await BookModels.Book.sync({ force: true });
    await fixture.initBooks();
    done();
});

after(() => {
    server.close();
});

describe('Home Test', () => {
    test('Deberia tener de titulo Bookli', browser => {
        browser
            .url(BASE_URL)
            .waitForElementVisible('body')
            .assert.titleContains('Bookli');
    });

    test('Deberia mostrar el logo de Bookli', browser => {
        browser
            .url(BASE_URL)
            .waitForElementVisible('body')
            .waitForElementVisible('.brand__logo')
            .assert.attributeContains(
                '.brand__logo',
                'src',
                '/assets/logo.svg'
            );
    });
    test('Deberia mostrar el placeholder buscar libro ej:El principito', browser => {
        browser
            .url(BASE_URL)
            .waitForElementVisible('body')
            .waitForElementVisible('body > header > div.search > input')
            .assert.attributeContains('body > header > div.search > input',
             'placeholder',
             'Buscar libro ej:El principito');
            
    });

    test('Deberia mostrar la lista de libros', browser => {
        browser
            .url(BASE_URL)
            .waitForElementVisible('body')
            .waitForElementVisible('.booklist .book')
            .assert.elementPresent('.booklist .book');
    });




/* Verifico el color modificado de los bordes*/
    test('El borde de cada libro deberia tener el color solicitado', browser => {
        browser
            .url(BASE_URL)
            .waitForElementVisible('body')
            .waitForElementVisible('.booklist .book')
            .assert.cssProperty(
                'body > main > div > div.books-container > div',
                'border-color', 
                'rgb(26, 32, 44)');
    });



    test('Deberia poder encontrar un libro por titulo', browser => {
        browser
            .url(BASE_URL)
            .waitForElementVisible('body')
            .waitForElementVisible('.booklist .book')
            .click('.search__input')
            .keys('Operaci')
            .pause(400)
            .expect.elements('.booklist .book')
            .count.to.equal(1);
    });

    test('Deberia mostrar un mensaje cuando no se encuentra un libro', browser => {
        browser
            .url(BASE_URL)
            .waitForElementVisible('body')
            .waitForElementVisible('.booklist .book')
            .click('.search__input')
            .keys('No existe')
            .pause(400);

        browser.expect.elements('.booklist .book').count.to.equal(0);
        browser.expect
            .element('.booklist.booklist--empty p')
            .text.to.equal(
                'Hmmm... Parece que no tenemos el libro que buscas.\nProba con otra busqueda.'
            );
    });
});

describe('Detail view', () => {
    test('Deberia mostrar boton para agregar a lista de lectura', browser => {
        browser
            .url(BASE_URL + '/detail/1')
            .waitForElementVisible('body')
            .waitForElementVisible('.book__actions [data-ref=addToList]');

        browser.expect
            .element('.book__actions [data-ref=addToList]')
            .text.to.equal('Empezar a leer');
    });

    test('Deberia mostrar boton para remover libro de la lista de lectura si el libro es parte de la lista de lectura', browser => {
        browser
            .url(BASE_URL + '/detail/1')
            .waitForElementVisible('body')
            .waitForElementVisible('.book__actions [data-ref=addToList]');

        browser
            .click('.book__actions [data-ref=addToList]')
            .pause(1000)
            .waitForElementVisible('.book__actions [data-ref=removeFromList]');

        browser.expect
            .element('.book__actions [data-ref=removeFromList]')
            .text.to.equal('Dejar de leer');
    });

    test('Deberia poder remover libro de la lista de lectura', browser => {
        browser
            .url(BASE_URL + '/detail/1')
            .waitForElementVisible('body')
            .waitForElementVisible('.book__actions [data-ref=addToList]');

        browser
            .click('.book__actions [data-ref=addToList]')
            .pause(400)
            .waitForElementVisible('.book__actions [data-ref=removeFromList]');

        browser.expect
            .element('.book__actions [data-ref=removeFromList]')
            .text.to.equal('Dejar de leer');

        browser
            .click('.book__actions [data-ref=removeFromList]')
            .pause(400)
            .waitForElementVisible('.book__actions [data-ref=addToList]');

        browser.expect
            .element('.book__actions [data-ref=addToList]')
            .text.to.equal('Empezar a leer');
    });

    test('Deberia poder finalizar un libro de la lista de lectura', browser => {
        browser
            .url(BASE_URL + '/detail/1')
            .waitForElementVisible('body')
            .waitForElementVisible('.book__actions [data-ref=addToList]');

        browser
            .click('.book__actions [data-ref=addToList]')
            .pause(400)
            .waitForElementVisible('.book__actions [data-ref=removeFromList]');

        browser.expect
            .element('.book__actions [data-ref=addToFinish]')
            .text.to.equal('Lo termine!');

        browser
            .click('.book__actions [data-ref=addToFinish]')
            .pause(400)
            .waitForElementVisible(
                '.book__actions [data-ref=removeFromFinish]'
            );

        browser.expect
            .element('.book__actions [data-ref=removeFromFinish]')
            .text.to.equal('Volver a leer');
    });

    test('Verificar enlace de brand corresponda a la pagina principal', browser => {
        browser
        .url(BASE_URL + '/detail/1')
            .waitForElementVisible('body')
            .waitForElementVisible('.brand__logo')
            .click('.brand__logo')
            .pause(400).assert.urlEquals(BASE_URL + "/");


        //verificar existencia de elementos de principal    
        browser
            //con los mismos elementos de muestra
            .url(BASE_URL)
            .waitForElementVisible('body')
            .waitForElementVisible('.booklist .book')
            .assert.elementPresent('.booklist .book');

        browser
            //input search
            .url(BASE_URL)
            .waitForElementVisible('body')
            .waitForElementVisible('.search')
            .assert.elementPresent('.search');
        
        browser
            //existencia de brand
            .url(BASE_URL)
            .waitForElementVisible('body')
            .waitForElementVisible('.brand')
            .assert.elementPresent('.brand');

        browser
            //existencia de filters containter
            .url(BASE_URL)
            .waitForElementVisible('body')
            .waitForElementVisible('.filters-container')
            .assert.elementPresent('.filters-container');
    });
});
