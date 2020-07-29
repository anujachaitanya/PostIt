const request = require('supertest');
const app = require('../src/app');
let { makeRequest } = require('../src/lib');

describe('GET', () => {
  afterEach(() => {
    app.locals.sessions = {};
  });

  it('should serve the static html and css files', (done) => {
    request(app)
      .get('/')
      .expect('Content-type', /text\/html/)
      .expect(/Dive deeper on topics that matter to you/, done);
  });

  it('should serve the static html and css files', (done) => {
    request(app)
      .get('/css/menubar.css')
      .set('Accept', '*/*')
      .expect('Content-type', /text\/css/)
      .expect(/body/, done);
  });
});

describe('GET /', () => {
  afterEach(() => {
    app.locals.sessions = {};
  });
  it('should serve sign in page if not signed in', (done) => {
    request(app)
      .get('/')
      .expect('Content-type', /text\/html/)
      .expect(/Dive deeper on topics that matter to you/, done);
  });

  it('should serve dashboard if signed in', (done) => {
    app.locals.sessions = { '1234': 1 };
    request(app)
      .get('/')
      .set('Cookie', 'sId=1234')
      .expect(/PostIt/, done);
  });
});

describe('GET /signIn', () => {
  afterEach(() => {
    app.locals.sessions = {};
  });
  it('should redirect to github authentication', (done) => {
    request(app).get('/signIn').expect(302, done);
  });
});

describe('POST /publish', () => {
  afterEach(() => {
    app.locals.sessions = {};
  });
  const data = {
    title: 'my title',
    content: {
      time: 1552744582955,
      blocks: [
        {
          type: 'text',
          data: {
            text:
              'https://cdn.pixabay.com/photo/2017/09/01/21/53/blue-2705642_1280.jpg',
          },
        },
      ],
      version: '2.11.10',
    },
  };

  it('Should publish the post', (done) => {
    app.locals.sessions = { '1234': 1 };
    request(app)
      .post('/user/publish/1')
      .set('Cookie', 'sId=1234')
      .set('Content-type', 'application/json')
      .send(JSON.stringify(data))
      .expect('Published')
      .expect(200, done);
  });
});

describe('Ensure login', () => {
  afterEach(() => {
    app.locals.sessions = {};
  });

  it('should get css file if session is there', (done) => {
    app.locals.sessions = { '1234': 1 };
    request(app)
      .get('/user/css/editor.css')
      .set('Cookie', 'sId=1234')
      .expect('Content-type', /text\/css/)
      .expect(200, done);
  });

  it('should give sign in if cookie are not there', (done) => {
    request(app).get('/user/editor').expect('Location', '/').expect(302, done);
  });
});

describe('GET /user/editor', () => {
  afterEach(() => {
    app.locals.sessions = {};
  });

  it('should get editor', (done) => {
    app.locals.sessions = { '1234': 1 };
    request(app)
      .get('/user/editor')
      .set('Cookie', 'sId=1234')
      .expect(/id="publish">Publish/)
      .expect(200, done);
  });
});

describe('GET /blog/id', () => {
  afterEach(() => {
    app.locals.sessions = {};
  });

  it('should return the blog content if the blog is published', (done) => {
    request(app)
      .get('/blog/1')
      .expect(/signIn/, done);
  });

  it('should return the blog content if the blog is published', (done) => {
    app.locals.sessions = { '1234': 1 };
    request(app)
      .get('/blog/1')
      .set('Cookie', 'sId=1234')
      .expect(/user-profile/, done);
  });

  it('should return page not found for invalid blogId', (done) => {
    app.locals.sessions = { '1234': 1 };
    request(app)
      .get('/blog/104540')
      .set('Cookie', 'sId=1234')
      .expect(/404 : Page Not Found/, done);
  });

  it('should return not found for string as blog Id ', (done) => {
    app.locals.sessions = { '1234': 1 };
    request(app)
      .get('/blog/1string')
      .set('Cookie', 'sId=1234')
      .expect(/404 : Page Not Found/, done);
  });
});

describe('GET /user/signOut', () => {
  afterEach(() => {
    app.locals.sessions = {};
  });

  it('user should be redirected to the signIn page after signOut', (done) => {
    app.locals.sessions = { '1234': 1 };
    request(app)
      .get('/user/signOut')
      .set('Cookie', 'sId=1234')
      .expect(302, done);
  });
});

describe('GET /seeAllComments/:blogId', () => {
  afterEach(() => {
    app.locals.sessions = {};
  });

  it('user should be redirected to the signIn page after signOut', (done) => {
    app.locals.sessions = { '1234': 1 };
    request(app)
      .get('/seeAllComments/1')
      .set('Cookie', 'sId=1234')
      .expect(/superb/)
      .expect(200, done);
  });
});

describe('POST /autosave', () => {
  afterEach(() => {
    app.locals.sessions = {};
  });

  it('should return back id of the new drafted post if request id is -1', (done) => {
    app.locals.sessions = { '1234': 1 };
    const data = {
      title: 'my title',
      content: {
        time: 1552744582955,
        blocks: [
          {
            type: 'text',
            data: {
              text:
                'https://cdn.pixabay.com/photo/2017/09/01/21/53/blue-2705642_1280.jpg',
            },
          },
        ],
        version: '2.11.10',
      },
    };
    request(app)
      .post('/user/autosave/-1')
      .set('Cookie', 'sId=1234')
      .set('Content-type', 'application/json')
      .send(JSON.stringify(data))
      .expect(/id/)
      .expect(/2/, done);
  });

  it('should return back id of the already drafted post on autosave', (done) => {
    app.locals.sessions = { '1234': 1 };
    const data = {
      title: 'my title',
      content: {
        time: 1552744582955,
        blocks: [
          {
            type: 'text',
            data: {
              text:
                'https://cdn.pixabay.com/photo/2017/09/01/21/53/blue-2705642_1280.jpg',
            },
          },
        ],
        version: '2.11.10',
      },
    };
    request(app)
      .post('/user/autosave/2')
      .set('Cookie', 'sId=1234')
      .set('Content-type', 'application/json')
      .send(JSON.stringify(data))
      .expect(/id/)
      .expect(/2/, done);
  });

  it('should return back id of the already drafted post on autosave', (done) => {
    const data = {};
    request(app)
      .post('/user/autosave/2')
      .set('Cookie', 'sId=1234')
      .set('Content-type', 'application/json')
      .send(JSON.stringify(data))
      .expect('Location', '/')
      .expect(302, done);
  });
});

describe('/user/publishComment', () => {
  it('should publish the given comment', (done) => {
    app.locals.sessions = { '1234': 1 };
    const data = { comment: 'hiii', blogId: 1 };
    request(app)
      .post('/user/publishComment/')
      .set('Cookie', 'sId=1234')
      .set('Content-type', 'application/json')
      .send(JSON.stringify(data))
      .expect('Published Comment')
      .expect(200, done);
  });
});
