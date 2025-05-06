- docker exec my-mysql sh -c mysqldump -uk6_test_user -pnestpw nestjs_test > /tmp/db_snapshot.sql
- docker cp my-mysql:/tmp/db_snapshot.sql ./db_snapshot.sql

- docker cp ./db_snapshot.sql my-mysql:/tmp/db_snapshot.sql
- docker exec -it my-mysql sh -c 'mysql -uk6_test_user -pnestpw nestjs_test -e "source /tmp/db_snapshot.sql"'
