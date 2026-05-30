using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    public partial class AddUserCredentials : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PasswordHash",
                table: "Users",
                type: "character varying(256)",
                maxLength: 256,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "UserName",
                table: "Users",
                type: "character varying(64)",
                maxLength: 64,
                nullable: false,
                defaultValue: "");

            migrationBuilder.Sql(@"
UPDATE ""Users""
SET ""UserName"" = CASE
    WHEN COALESCE(NULLIF(TRIM(""Email""), ''), '') <> '' THEN LOWER(SPLIT_PART(""Email"", '@', 1)) || '-' || ""Id""
    ELSE 'user-' || ""Id""
END
WHERE COALESCE(NULLIF(TRIM(""UserName""), ''), '') = '';

UPDATE ""Users""
SET ""PasswordHash"" = 'RESET_REQUIRED'
WHERE COALESCE(NULLIF(TRIM(""PasswordHash""), ''), '') = '';

WITH duplicates AS (
    SELECT ""Id"", ""UserName"",
           ROW_NUMBER() OVER (PARTITION BY ""UserName"" ORDER BY ""Id"") AS duplicate_rank
    FROM ""Users""
)
UPDATE ""Users"" AS users
SET ""UserName"" = users.""UserName"" || '-' || users.""Id""
FROM duplicates
WHERE users.""Id"" = duplicates.""Id""
  AND duplicates.duplicate_rank > 1;

WITH duplicate_emails AS (
    SELECT ""Id"", ""Email"",
           ROW_NUMBER() OVER (PARTITION BY LOWER(""Email"") ORDER BY ""Id"") AS duplicate_rank
    FROM ""Users""
)
UPDATE ""Users"" AS users
SET ""Email"" = SPLIT_PART(users.""Email"", '@', 1) || '+' || users.""Id"" || '@' || SPLIT_PART(users.""Email"", '@', 2)
FROM duplicate_emails
WHERE users.""Id"" = duplicate_emails.""Id""
  AND duplicate_emails.duplicate_rank > 1;

DELETE FROM ""Users""
WHERE COALESCE(NULLIF(TRIM(""Email""), ''), '') = '';
");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_UserName",
                table: "Users",
                column: "UserName",
                unique: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_Email",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_UserName",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "PasswordHash",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "UserName",
                table: "Users");
        }
    }
}
