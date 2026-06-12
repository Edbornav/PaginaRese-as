using MongoDB.Bson;
using MongoDB.Driver;

namespace EntertainmentReviews.API.Services;

public static class DatabaseInitializer
{
    public static async Task InitializeAsync(IMongoClient client, string databaseName)
    {
        var db = client.GetDatabase(databaseName);

        await ConfigureCollection(db, "users", new BsonDocument
        {
            { "$jsonSchema", new BsonDocument
                {
                    { "bsonType", "object" },
                    { "required", new BsonArray { "email", "passwordHash", "username", "role" } },
                    { "properties", new BsonDocument
                        {
                            { "email", new BsonDocument { { "bsonType", "string" } } },
                            { "passwordHash", new BsonDocument { { "bsonType", "string" } } },
                            { "username", new BsonDocument { { "bsonType", "string" } } },
                            { "role", new BsonDocument { { "enum", new BsonArray { "user", "admin" } } } }
                        }
                    }
                }
            }
        });

        await ConfigureCollection(db, "catalog_items", new BsonDocument
        {
            { "$jsonSchema", new BsonDocument
                {
                    { "bsonType", "object" },
                    { "required", new BsonArray { "title", "category", "creator", "description" } },
                    { "properties", new BsonDocument
                        {
                            { "title", new BsonDocument { { "bsonType", "string" } } },
                            { "category", new BsonDocument { { "bsonType", "string" } } },
                            { "creator", new BsonDocument { { "bsonType", "string" } } },
                            { "description", new BsonDocument { { "bsonType", "string" } } },
                            { "averageRating", new BsonDocument { { "bsonType", "double" } } },
                            { "reviewCount", new BsonDocument { { "bsonType", "int" } } }
                        }
                    }
                }
            }
        });

        await ConfigureCollection(db, "reviews", new BsonDocument
        {
            { "$jsonSchema", new BsonDocument
                {
                    { "bsonType", "object" },
                    { "required", new BsonArray { "catalogItemId", "userId", "username", "comment", "rating" } },
                    { "properties", new BsonDocument
                        {
                            { "catalogItemId", new BsonDocument { { "bsonType", "objectId" } } },
                            { "userId", new BsonDocument { { "bsonType", "objectId" } } },
                            { "username", new BsonDocument { { "bsonType", "string" } } },
                            { "comment", new BsonDocument { { "bsonType", "string" } } },
                            { "rating", new BsonDocument { { "bsonType", "int" }, { "minimum", 0 }, { "maximum", 10 } } }
                        }
                    }
                }
            }
        });

        await ConfigureCollection(db, "item_requests", new BsonDocument
        {
            { "$jsonSchema", new BsonDocument
                {
                    { "bsonType", "object" },
                    { "required", new BsonArray { "title", "category", "creator", "description", "status" } },
                    { "properties", new BsonDocument
                        {
                            { "title", new BsonDocument { { "bsonType", "string" } } },
                            { "category", new BsonDocument { { "bsonType", "string" } } },
                            { "creator", new BsonDocument { { "bsonType", "string" } } },
                            { "description", new BsonDocument { { "bsonType", "string" } } },
                            { "status", new BsonDocument { { "enum", new BsonArray { "pending", "approved", "rejected" } } } }
                        }
                    }
                }
            }
        });
    }

    private static async Task ConfigureCollection(IMongoDatabase db, string name, BsonDocument validator)
    {
        try
        {
            await db.RunCommandAsync<BsonDocument>(new BsonDocument
            {
                { "collMod", name },
                { "validator", validator },
                { "validationLevel", "moderate" },
                { "validationAction", "error" }
            });
        }
        catch (MongoCommandException ex) when (ex.CodeName == "NamespaceNotFound")
        {
            var opts = new CreateCollectionOptions
            {
                Validator = validator,
                ValidationLevel = CollectionValidationLevel.Moderate,
                ValidationAction = CollectionValidationAction.Error
            };
            await db.CreateCollectionAsync(name, opts);
        }
    }
}
