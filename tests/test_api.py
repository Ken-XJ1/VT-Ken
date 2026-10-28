import unittest
from datetime import datetime, timedelta, timezone
from unittest.mock import MagicMock, patch

import jwt
import psycopg2

import app as application


def mock_connection(fetchone=None, fetchall=None):
    connection = MagicMock()
    cursor = MagicMock()
    connection.__enter__.return_value = connection
    connection.cursor.return_value.__enter__.return_value = cursor
    cursor.fetchone.return_value = fetchone
    cursor.fetchall.return_value = fetchall or []
    return connection, cursor


def auth_header(role="ciudadano", user_id=17, expires=None):
    token = jwt.encode(
        {
            "sub": user_id,
            "nombre": "Persona de prueba",
            "email": "persona@example.test",
            "rol": role,
            "exp": expires or datetime.now(timezone.utc) + timedelta(hours=1),
            "iat": datetime.now(timezone.utc),
        },
        application.SECRET_KEY,
        algorithm="HS256",
    )
    return {"Authorization": f"Bearer {token}"}


class ApiTestCase(unittest.TestCase):
    def setUp(self):
        application.app.config.update(TESTING=True)
        self.client = application.app.test_client()


class RegistrationTests(ApiTestCase):
    @patch.object(application, "get_db")
    def test_registration_requires_name_email_and_password(self, get_db):
        response = self.client.post("/api/auth/registro", json={"nombre": "Ana"})

        self.assertEqual(response.status_code, 400)
        self.assertIn("requeridos", response.get_json()["error"])
        get_db.assert_not_called()

    @patch.object(application, "get_db")
    def test_registration_rejects_short_password(self, get_db):
        response = self.client.post(
            "/api/auth/registro",
            json={"nombre": "Ana", "email": "ana@example.test", "password": "12345"},
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("6 caracteres", response.get_json()["error"])
        get_db.assert_not_called()

    @patch.object(application, "get_db")
    def test_registration_rejects_invalid_email(self, get_db):
        response = self.client.post(
            "/api/auth/registro",
            json={"nombre": "Ana", "email": "no-es-email", "password": "secreto1"},
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("email", response.get_json()["error"])
        get_db.assert_not_called()

    @patch.object(application, "get_db")
    def test_registration_normalizes_email_and_returns_token(self, get_db):
        connection, cursor = mock_connection(
            fetchone={
                "id": 31,
                "nombre": "Ana",
                "apellido": None,
                "email": "ana@example.test",
                "rol": "ciudadano",
            }
        )
        get_db.return_value = connection

        response = self.client.post(
            "/api/auth/registro",
            json={"nombre": "Ana", "email": " ANA@EXAMPLE.TEST ", "password": "secreto1"},
        )

        self.assertEqual(response.status_code, 201)
        self.assertEqual(response.get_json()["user"]["email"], "ana@example.test")
        self.assertTrue(response.get_json()["token"])
        registration_call = next(
            call for call in cursor.execute.call_args_list
            if "INSERT INTO usuarios" in call.args[0]
        )
        params = registration_call.args[1]
        self.assertEqual(params[2], "ana@example.test")


class LoginTests(ApiTestCase):
    @patch.object(application, "get_db")
    def test_login_uses_same_message_for_unknown_email(self, get_db):
        connection, _ = mock_connection(fetchone=None)
        get_db.return_value = connection

        response = self.client.post(
            "/api/auth/login",
            json={"email": "missing@example.test", "password": "incorrecta"},
        )

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.get_json()["error"], "Credenciales incorrectas")

    @patch.object(application, "get_db")
    def test_login_rejects_inactive_account(self, get_db):
        connection, _ = mock_connection(
            fetchone={
                "id": 3,
                "nombre": "Inactiva",
                "email": "inactiva@example.test",
                "rol": "ciudadano",
                "password_hash": "$2b$12$invalidhash",
                "activo": False,
            }
        )
        get_db.return_value = connection

        response = self.client.post(
            "/api/auth/login",
            json={"email": "inactiva@example.test", "password": "secreto1"},
        )

        self.assertEqual(response.status_code, 403)
        self.assertIn("Cuenta desactivada", response.get_json()["error"])


class AuthorizationTests(ApiTestCase):
    @patch.object(application, "get_db")
    def test_protected_route_rejects_missing_token(self, get_db):
        response = self.client.get("/api/reportes")

        self.assertEqual(response.status_code, 401)
        get_db.assert_not_called()

    @patch.object(application, "get_db")
    def test_admin_route_rejects_citizen_token(self, get_db):
        response = self.client.get("/api/admin/stats", headers=auth_header())

        self.assertEqual(response.status_code, 403)
        get_db.assert_not_called()

    @patch.object(application, "get_db")
    def test_protected_route_rejects_expired_token(self, get_db):
        response = self.client.get(
            "/api/reportes",
            headers=auth_header(expires=datetime.now(timezone.utc) - timedelta(minutes=1)),
        )

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.get_json()["error"], "Token expirado")
        get_db.assert_not_called()


class ReportAndMessageTests(ApiTestCase):
    @patch.object(application, "get_db")
    def test_report_requires_symptoms(self, get_db):
        response = self.client.post(
            "/api/reportes",
            json={"sintomas": "   "},
            headers=auth_header(),
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("sintomas", response.get_json()["error"])
        get_db.assert_not_called()

    @patch.object(application, "get_db")
    def test_citizen_report_history_is_scoped_to_authenticated_user(self, get_db):
        connection, cursor = mock_connection(fetchall=[])
        get_db.return_value = connection

        response = self.client.get("/api/reportes", headers=auth_header(user_id=42))

        self.assertEqual(response.status_code, 200)
        query, params = cursor.execute.call_args.args
        self.assertIn("WHERE r.usuario_id = %s", query)
        self.assertEqual(params, (42,))

    @patch.object(application, "get_db")
    def test_message_requires_subject_and_body(self, get_db):
        response = self.client.post(
            "/api/mensajes",
            json={"asunto": "   ", "mensaje": ""},
            headers=auth_header(),
        )

        self.assertEqual(response.status_code, 400)
        self.assertIn("asunto y mensaje", response.get_json()["error"])
        get_db.assert_not_called()


class HealthTests(ApiTestCase):
    @patch.object(application, "get_db", side_effect=psycopg2.OperationalError("database unavailable"))
    def test_health_reports_database_failure_as_service_unavailable(self, get_db):
        response = self.client.get("/api/health")

        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.get_json()["status"], "error")
        self.assertEqual(response.get_json()["database"], "database unavailable")


if __name__ == "__main__":
    unittest.main()
