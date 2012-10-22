#!/bin/bash


ELEITORADO='verifica_eleitorado_geral'
PREFEITOS='verifica_prefeitos_geral'
VOTOS='verifica_votos_geral'

cat 'eleitorado_partidos.json' > $ELEITORADO
cat 'eleitorado_partidos_outros.json' >> $ELEITORADO
cat 'prefeitos_partidos.json' > $PREFEITOS
cat 'prefeitos_partidos_outros.json' >> $PREFEITOS
cat 'votos_partidos.json' > $VOTOS
cat 'votos_partidos_outros.json' >> $VOTOS

sed -e 's@.*dados2012":\[\(\d*\),\d*\].*@\1@g' $ELEITORADO
#sed -e 's@\[30,30,1200\]@[valor_1,valor_2,valor_maximo]@g' $arquivo > $TEMPFILE


#echo `awk '{s+=$1} END {print s}' $ARQUIVO`
