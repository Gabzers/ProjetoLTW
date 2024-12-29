<?php
/* session_start();

if (!isset($_SESSION["username"]) || $_SESSION["type"] != "admin") {
    header("Location: index.php");
    exit();
} */

$host = "localhost";
$user = "root";
$password = "";
$db = "users";

$data = mysqli_connect($host, $user, $password, $db);
if ($data === false) {
    die("Erro na conexão com o banco de dados: " . mysqli_connect_error());
}

$sql = "SELECT id, login, password, nome, morada, nif, email, type, active FROM login";

// Processamento do formulário de edição de dependências
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $login = $_POST["new_login"];
    $password = $_POST["new_password"];
    $nome = $_POST["new_nome"];
    $morada = $_POST["new_morada"];
    $nif = $_POST["new_nif"];
    $email = $_POST["new_email"];
    $type = $_POST["new_type"];
    $active = $_POST["new_active"];

    // Atualiza a dependência no banco de dados
    $sql = "UPDATE tabela SET login = ?, password = ?, nome = ?, morada = ?, nif = ?, email = ?, type = ?, active = ? WHERE id = ?";
    $stmt = $data->prepare($sql);
    $stmt->bind_param("ssssssssi", $login, $password, $nome, $morada, $nif, $email, $type, $active, $id);
    if ($stmt->execute()) {
        echo "Dependência atualizada com sucesso!";
    } else {
        echo "Erro ao atualizar dependência: " . $stmt->error;
    }
}

$components = mysqli_fetch_all($result, MYSQLI_ASSOC);
?>