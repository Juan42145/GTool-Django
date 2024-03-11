# build_files.sh
pip install -r requirements.txt
cd src
python3.9 manage.py collectstatic
python3.9 manage.py makemigrations
python3.9 manage.py migrate
