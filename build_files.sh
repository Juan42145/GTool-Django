# build_files.sh
pip install -r requirements.txt
python3.12 manage.py collectstatic
python3.12 manage.py makemigrations
python3.12 manage.py migrate
