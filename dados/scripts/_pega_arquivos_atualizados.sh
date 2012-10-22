#!/bin/bash

ARQUIVOS=`cat arquivosJson`
ARQUIVOTEMP='TEMPFILE.tmp'
URLBASE='http://politica.estadao.com.br/eleicoes/apuracao/2012/1turno/includes-resultados/estadao-dados/dados/'

while sleep 40; do
    for arquivo in $ARQUIVOS
        do
            linkCompleto=$URLBASE$arquivo
            echo "Fazendo o download de $arquivo"
            if [ -f $arquivo ]:
                then
                    mv $arquivo $arquivo.bkp
                fi
            `wget -N -t10 --retry-connrefused $linkCompleto`
            echo ".................................................ok"
        done
done
