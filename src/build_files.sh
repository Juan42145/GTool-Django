# build_files.sh

python3.9 -m venv venv
source venv/bin/activate
# install all deps in the venv
pip install -r requirements.txt
python3.9 - m pip install -r requirements.txt
python3.9 manage.py collectstatic
python3.9 manage.py makemigrations
python3.9 manage.py migrate
