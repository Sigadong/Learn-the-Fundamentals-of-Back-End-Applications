const mapDBToModel = {
  modelSongs: ({
    id,
    title,
    year,
    performer,
    genre,
    duration,
    inserted_at,
    updated_at,
  }) => ({
    id,
    title,
    year,
    performer,
    genre,
    duration,
    insertedAt: inserted_at,
    updatedAt: updated_at,
  }),
  modelPlaylists: ({
    id,
    name,
    username,
  }) => ({
    id,
    name,
    username,
  }),
};

module.exports = { mapDBToModel };
