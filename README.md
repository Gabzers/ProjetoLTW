# LTW-ES Project

This project is a user and component management system designed for an engineering project. It provides functionalities for administrators and developers to manage users, components, and versions.

## Table of Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)
- [Backup Strategy](#backup-strategy)
- [Contributing](#contributing)
- [License](#license)

## Features

### User Management:
- **Registration**: Allows administrators to register new users.
- **Login**: Users can log in with their credentials.
- **Edit User**: Administrators can edit user details.
- **Delete User**: Administrators can delete users.
- **User List**: Displays a list of all users.

### Component Management:
- **Add Component**: Developers can add new components.
- **Edit Component**: Developers can edit existing components.
- **Delete Component**: Developers can delete components.
- **Component List**: Displays a list of all components.

### Version Management:
- **Add Version**: Developers can add new versions for components.
- **Delete Version**: Developers can delete versions.
- **Version List**: Displays a list of all versions for a specific component.

### Authentication and Authorization:
- **Session Management**: Uses sessions to manage user authentication and authorization.
- **Access Control**: Middleware functions ensure that only authenticated users can access certain routes.

### Database Interaction:
- **MySQL Database**: The application connects to a MySQL database to store and retrieve data.
- **CRUD Operations**: Performs Create, Read, Update, and Delete operations on the database.

### UI and UX:
- **Responsive Design**: The application uses CSS and HTML to provide a responsive and user-friendly interface.
- **Dark Mode**: Users can toggle between light and dark modes.
- **Language Support**: Provides options to switch between languages (e.g., Portuguese and English).

## Technologies Used

### Frontend:
- **HTML**
- **CSS**
- **JavaScript**
- **Libraries**:
  - Boxicons
  - Font Awesome

### Backend:
- **Node.js**
- **Express.js**
- **MySQL**
- **Sequelize**

### Middleware:
- **body-parser**
- **cookie-parser**
- **cors**
- **express-session**

### Version Control:
- **Git**
- **GitHub**

### Development Tools:
- **Visual Studio Code**
- **npm**

## Installation

### Prerequisites:
- Node.js and npm installed.
- MySQL server set up.

### Steps:
1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Navigate to the project directory:
   ```bash
   cd <project-directory>
   ```
3. Install the dependencies:
   ```bash
   npm install
   ```
4. Set up the MySQL database:
   - Create a database named `ltw-projeto`.
   - Import the database schema from the provided SQL file.
   - Configure the database connection in `app.js`.
5. Start the server:
   ```bash
   npm start
   ```
6. Open your browser and navigate to `http://localhost:3000`.

## Usage

### Login:
Access the login page at `http://localhost:3000` and log in with your credentials.

### User Management:
Administrators can manage users by navigating to the Users page.

### Component Management:
Developers can manage components by navigating to the Components page.

### Version Management:
Developers can manage versions by navigating to the Versions page.

## API Endpoints

### User Management:
- `POST /iRegister`: Register a new user.
- `POST /ilogin`: Log in a user.
- `POST /editUser/:id`: Edit user details.
- `DELETE /deleteUser/:userId`: Delete a user.
- `GET /getUsersJson`: Get a list of all users in JSON format.

### Component Management:
- `POST /iComponent`: Add a new component.
- `DELETE /deleteComponent/:componentId`: Delete a component.
- `GET /getComponentsJson`: Get a list of all components in JSON format.
- `GET /checkComponent/:name`: Check if a component name already exists.

### Version Management:
- `POST /iVersion`: Add a new version.
- `DELETE /deleteVersion/:versionId`: Delete a version.
- `GET /getVersionsJson/:id_comp`: Get a list of all versions for a specific component in JSON format.
- `GET /checkVersion/:idComp/:version`: Check if a version already exists for a component.

### Authentication and Authorization:
- `GET /logout`: Log out a user.
- `GET /getUser`: Get the authenticated user's information.

## Backup Strategy

### Database Backups:
- Regular backups of the MySQL database are created using `mysqldump`.
- Automated scripts can be set up to automate the backup process.

### File Backups:
- Static assets and configuration files are backed up to ensure the frontend resources are available.

### Version Control:
- The use of Git for version control inherently provides a backup of the codebase.
- Hosting the repository on GitHub adds an additional layer of backup.

### HTML Backups:
- Backup versions of important HTML files are maintained to ensure UI components can be restored if needed.

## Contributing

1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b <branch-name>
   ```
3. Make your changes and commit them:
   ```bash
   git commit -m "Description of changes"
   ```
4. Push to the branch:
   ```bash
   git push origin <branch-name>
   ```
5. Open a pull request.

## License

This project is licensed under the ISC License. See the LICENSE file for details.

