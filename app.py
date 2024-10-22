from flask import Flask, request, render_template, redirect, url_for
from flask_sqlalchemy import SQLAlchemy
from werkzeug.utils import secure_filename
import os
from pathlib import Path


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'uploads')
app.config['ALLOWED_EXTENSIONS'] = {'mp4', 'webm', 'mkv', 'avi', 'pdf'}  # Permitir archivos PDF también
db = SQLAlchemy(app)

# Crear el directorio de carga si no existe
if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False)
    video_filename = db.Column(db.String(100), nullable=False)
    pdf_filename = db.Column(db.String(100), nullable=True)  # Nuevo campo para el nombre del archivo PDF

with app.app_context():
    db.create_all()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/submit', methods=['POST'])
def submit():
    name = request.form['name']
    email = request.form['email']
    video = request.files['video']
    pdf = request.files.get('pdf')  # Obtener el archivo PDF si se proporcionó

    if video and allowed_file(video.filename):
        video_filename = secure_filename(video.filename)
        video.save(os.path.join(app.config['UPLOAD_FOLDER'], video_filename))

        if pdf and allowed_file(pdf.filename):  # Verificar si se proporcionó un archivo PDF y si es válido
            pdf_filename = secure_filename(pdf.filename)
            pdf.save(os.path.join(app.config['UPLOAD_FOLDER'], pdf_filename))
        else:
            pdf_filename = None  # Si no se proporcionó un archivo PDF, establecer a None

        user = User(name=name, email=email, video_filename=video_filename, pdf_filename=pdf_filename)
        db.session.add(user)
        db.session.commit()

        return redirect(url_for('success'))
    else:
        return "Error: el archivo no es válido o no se proporcionó."

@app.route('/success')
def success():
    users = User.query.all()
    return render_template('success.html', users=users)

@app.route('/delete/<int:video_id>', methods=['POST'])
def delete_video(video_id):
    video_to_delete = User.query.get_or_404(video_id)
    
    # Comprobar si el archivo de video existe en el servidor
    file_path = os.path.join(app.config['UPLOAD_FOLDER'], video_to_delete.video_filename)
    if Path(file_path).is_file():
        # Si el archivo existe, eliminarlo del servidor
        os.remove(file_path)
    else:
        # Si no existe, imprimir una advertencia
        print(f"Advertencia: El archivo '{file_path}' no se encuentra en el servidor.")

    # Eliminar el registro de video de la base de datos
    db.session.delete(video_to_delete)
    db.session.commit()
    return redirect(url_for('index'))

if __name__ == '__main__':
    app.run(debug=True)
