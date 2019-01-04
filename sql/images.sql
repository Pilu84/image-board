DROP TABLE IF EXISTS images, comments;

CREATE TABLE images(
    id SERIAL PRIMARY KEY,
    url VARCHAR(300) NOT NULL,
    username VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE comments(
    id SERIAL PRIMARY KEY,
    c_username VARCHAR(255) NOT NULL,
    comment TEXT,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    img_id INTEGER NOT NULL REFERENCES images(id)
);

CREATE TABLE tagmap (
    id SERIAL PRIMARY KEY,
    img_id INTEGER NOT NULL REFERENCES images(id),
    tag_id INTEGER NOT NULL REFERENCES tags(id)
);

CREATE TABLE tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255)
);


INSERT INTO images (url, username, title, description) VALUES (
    'https://s3.amazonaws.com/spicedling/jAVZmnxnZ-U95ap2-PLliFFF7TO0KqZm.jpg',
    'funkychicken',
    'Welcome to Berlin and the future!',
    'This photo brings back so many great memories.'
);

INSERT INTO images (url, username, title, description) VALUES (
    'https://s3.amazonaws.com/spicedling/wg8d94G_HrWdq7bU_2wT6Y6F3zrX-kej.jpg',
    'discoduck',
    'Elvis',
    'We can''t go on together with suspicious minds.'
);

INSERT INTO images (url, username, title, description) VALUES (
    'https://s3.amazonaws.com/spicedling/XCv4AwJdm6QuzjenFPKJocpipRNNMwze.jpg',
    'discoduck',
    'Hello Berlin',
    'This is going to be worth a lot of money one day.'
);

INSERT INTO comments (c_username, comment, img_id) VALUES (
    'Oliver',
    'This comment for test',
    1
);
