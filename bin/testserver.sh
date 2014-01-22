DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

i="0"

while [ $i -lt 100 ] 
do

  curl "localhost:3000/api/convert%20-resize%20100x100" -F myfile=@"$DIR/blackhole.png" > /dev/null 2> /dev/null & 
  i=$[$i+1]
done