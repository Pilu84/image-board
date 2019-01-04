const spicedPg = require("spiced-pg");

const db = spicedPg(`postgres:postgres:postgres@localhost:5432/image`);

exports.getPictureUrl = limit => {
    return db.query(
        `SELECT *,  (
            SELECT COUNT(id) AS count FROM images WHERE id < $1
        ) FROM images
                    ORDER BY id DESC
                    LIMIT $1`,

        [limit]
    );
};

exports.getMorePicture = (id, limit) => {
    return db.query(
        `SELECT *,  (
            SELECT COUNT(id) AS count FROM images WHERE id < $1
        )
        FROM images
        WHERE id < $1
        ORDER BY id DESC
        LIMIT $2 `,

        [id, limit]
    );
};

exports.getSinglePicture = id => {
    return db.query(
        `SELECT *, (
        SELECT id AS next_id FROM images WHERE id > $1
        LIMIT 1
    ), (
        SELECT id AS prev_id FROM images
        WHERE id < $1
        ORDER BY id DESC
        LIMIT 1
    ) FROM images WHERE id = $1`,
        [id]
    );
};

exports.getComments = imgid => {
    return db.query(
        `SELECT * FROM comments WHERE img_id = $1
                    ORDER BY id DESC`,
        [imgid]
    );
};

exports.uploadPicture = (url, username, title, description) => {
    return db.query(
        `INSERT INTO images (url, username, title, description)
        VALUES ($1, $2, $3, $4)
        RETURNING *`,

        [url, username, title, description]
    );
};

exports.sendComment = (c_username, comment, img_id) => {
    return db.query(
        `INSERT INTO comments (c_username, comment, img_id)
            VALUES ($1, $2, $3)
            RETURNING *`,

        [c_username, comment, img_id]
    );
};

exports.setTags_name = tag_name => {
    db.query(
        `INSERT INTO tags (name)
                        SELECT $1
                        WHERE NOT EXISTS (
                            SELECT id FROM tags WHERE name = $2
                        )`,

        [tag_name, tag_name]
    );

    return db.query(
        `SELECT id FROM tags WHERE name = $1`,

        [tag_name]
    );
};

exports.setTag_map = (img_id, tag_id) => {
    return db.query(
        `INSERT INTO tagmap (img_id, tag_id)
        VALUES ($1, $2)`,

        [img_id, tag_id]
    );
};

exports.getAllTagId = () => {
    return db.query(`SELECT * FROM tags;`);
};

exports.getTagsId = tag_name => {
    return db.query(
        `SELECT id FROM tags WHERE name = $1`,

        [tag_name]
    );
};

exports.getTagsImgId = tag_id => {
    return db.query(
        `SELECT img_id FROM tagmap WHERE tag_id = $1`,

        [tag_id]
    );
};

exports.getImageByTag = imgId => {
    return db.query(
        `SELECT * FROM images WHERE id = $1`,

        [imgId]
    );
};
