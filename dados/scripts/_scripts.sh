#!/bin/bash

function ajustaConteudos {
    PARTIDOS=`tr '[A-Z]' '[a-z]' < lista_partidos`
    FINAL="_estados.json"
    VOTOS="votos_"
    ELEITORADO="eleitorado_"

    for partido in $PARTIDOS
        do
            arquivo=_prefeitos/prefeitos_$partido$FINAL
            echo $arquivo
            sed -e 's@prefeitos@votos@g' $arquivo > $VOTOS$partido$FINAL
            sed -e 's@prefeitos@eleitorado@g' $arquivo > $ELEITORADO$partido$FINAL
        done
}

function geraArquivos2turno {
    echo ""
}

function criandoPatterns {
    ARQUIVOS=`ls *estados*.json`
    TEMPFILE="TEMPFILE.tmp"
    for arquivo in $ARQUIVOS
        do
            sed -e 's@dados2008":\[(\d\+),(.*?),(\d\+)\],"dados2012@dados2008":[\1,0,\3],"dados2012@g' $arquivo > $TEMPFILE
            #sed -e 's@valor_2@0@g' $arquivo > $TEMPFILE
            mv $TEMPFILE $arquivo
        done
}

function formataDados2Turno {
    
    ##################################################################
    #                              Variáveis                         #
    ##################################################################

    #Variáveis Gerais
    PARTIDOS=`tr '[A-Z]' '[a-z]' < lista_partidos`
    FINAL="_estados.json"
    OUTROS="_estados_outros.json"
    NACIONAL="_partidos.json"
    NACIONAL2="_partidos_outros.json"
    TEMP="TEMP.tmp"

    #Variáveis para Prefeitos
    PREFEITOS="prefeitos_"

    #Variáveis para Votos
    VOTOS="votos_"

    #Variáveis para Eleitorado
    ELEITORADO="eleitorado_"

    #Variáveis para 2o turno
    T2="2turno_"
    
    ##################################################################
    #                       Expressões Regulares                     #
    ##################################################################
    #Bases de busca das expressões regulares
        #reTitle -> Replace com \1 partido ou estado, a depender do arquivo
        reTitle='"title":"\([A-Z]*\)","nextlevel":"'

        #reDados -> Replaces com:
                # \1 = valor do primeiro turno de 2008
                # \2 = valor máximo atingível ao fim do segundo turno de 2008
                # \3 = valor do pimeiro turno de 2012
                # \4 = valor máximo atingível ao fim do segundo turno de 2012
                # \5 = valor final atingido ao fim de 2008 - total de prefeitos eleitos em 2008
        reDados='"dados2008":\[\([0-9]*\),\([0-9]*\)\],'
        reDados+='"dados2012":\[\([0-9]*\),\([0-9]*\)\],'
        reDados+='"valorFinal2008":\[\([0-9]*\)\]'
    
    #Bases de substituição das expressões regulares
        replaceTitulo='"title":"\1","nextlevel":"'
        
        #replaceConsolidado -> Replace para as visualizações de consolidação das eleições
                # dados2008:['valorFinalDe2008'] \2 relativo ao reDados
                # dados2012:['valor1Turno','valor2Turno'] \3 relativo ao reDados e valor2Turno a ser preenchido pela TI
                    # valor2Turno é a soma do valor1Turno com os eleitos no segundo turno
                # valorFinal2008:[]
        replaceConsolidado='\"dados2008\":[\2],\"dados2012\":[\3,0],\"valorFinal2008":[]'

        #replace2Turno -> Replace para as visualizações exclusivas do segundo turno
                # dados2012:['valor2Turno'] -> valor a ser preenchido pela TI exclusivamente com os prefeitos eleitos no segundo turno
        replace2Turno='\"dados2008\":[],\"dados2012\":[0],\"valorFinal2008":[]'


    ##################################################################
    #                   Funções de geração dos arquivos              #
    ##################################################################
    # ARQUIVOS CONSOLIDADOS
        # GERAIS (Nacionais)
            # formato do nome:
                # <projecao>_partidos.json
                # ou
                # <projecao>_partidos_outros.json
        # DOS PARTIDOS (infos estaduais)
            # formato do nome:
                # <projecao>_<partido>_estados.json
                # ou
                # <projecao>_<partido>_estados_outros.json
        ARQS=`ls eleitorado*.json`
        ARQS+=' '
        ARQS+=`ls prefeitos*.json`
        for arq in $ARQS
        do
            echo $arq
            sed -e "s@$reDados@$replaceConsolidado@g" $arq > $TEMP
            mv $TEMP $arq
        done

#    # ARQUIVO DO SEGUNDO TURNO
#        Partidos2Turno=(   )
#        Estados=(   )
#        Estados=(   )
#        Estados=(   )
#        Estados=(   )
#        Estados=(   )
#        Estados=(   )
#        Estados=(   )
#        Estados=(   )
#        Estados=(   )
#        Estados=(   )
#        Estados=(   )
#        Estados=(   )
#        Estados=(   )
#        Estados=(   )
#        Estados=(   )
#        Estados=(   )
#        Estados=(   )
        # GERAL (Nacional)
            #formato do nome:
                # 2turno_prefeitos_partidos.json
                # ou
                # 2turno_prefeitos_partidos_outros.json
        
        # DOS PARTIDOS (infos estaduais)
            # formato do nome:
                # 2turno_prefeitos_<partido>_estados.json
                # ou
                # 2turno_prefeitos_<partido>_estados_outros.json
    
        #Gerando Json do segundo turno
            #

    #Visualizações Consolidadas (1oTurno + 2oTurno), Prefeito e Eleitorado


    #Visualização referente ao Segundo Turno (Só informações de prefeito das 50 cidades do 2oTurno), apenas Prefeito
        ## dados2008:[] ; dados2012:['valor2Turno'] ; valorFinal2008:[]


#    for partido in $PARTIDOS
#        do
#            echo ""
#            echo "############################ PARTIDO $partido ############################"
#            
#            
#            #Arquivos gerais nacionais
#            #TODO
#
#            #Arquivos de cada partido por estado
#            ##ELEITORADO
#                #eleitorado - parte 1
#                echo "######################## eleitorado 01"
#                arquivo=$ELEITORADO$partido$FINAL
#                re1=$reTitle
#                re1+='eleitorado_partidos'
#                replace1=$rep1
#                replace1+="eleitorado_$partido"
#                replace1+="_"
#                sed -e "s@$regEx1@$replace1\1@g" $arquivo1 | \
#                sed -e "s@$regEx2@$replace2@g" > $TEMPFILE
#                mv $TEMPFILE $arquivo1
#                
#                #eleitorado - parte 2 (outros)
#                echo "######################## eleitorado outros"
#                arquivo2=$ELEITORADO$partido$OUTROS
#                regEx1=$regTitle
#                regEx1+='eleitorado_partidos'
#                replace1+="eleitorado_$partido"
#                replace1+="_"
#                sed -e "s@$regEx1@$replace1\1@g" $arquivo2 | \
#                sed -e "s@$regEx2@$replace2@g" > $TEMPFILE
#                mv $TEMPFILE $arquivo2
#
#            ##PREFEITOS
#                #prefeitos #prefeitos - parte 1
#                echo "######################## prefeitos - 01"
#                arquivo3=$PREFEITOS$partido$FINAL
#                regEx1=$regTitle
#                regEx1+='prefeitos_partidos'
#                replace1+="prefeitos_$partido"
#                replace1+="_"
#                sed -e "s@$regEx1@$replace1\1@g" $arquivo3 | \
#                sed -e "s@$regEx2@$replace2@g" > $TEMPFILE
#                mv $TEMPFILE $arquivo3
#                
#                #prefeitos - parte 2 (outros)
#                echo "######################## prefeitos outros"
#                arquivo4=$PREFEITOS$partido$OUTROS
#                regEx1=$regTitle
#                regEx1+='prefeitos_partidos'
#                replace1+="prefeitos_$partido"
#                replace1+="_"
#                sed -e "s@$regEx1@$replace1\1@g" $arquivo4 | \
#                sed -e "s@$regEx2@$replace2@g" > $TEMPFILE
#                mv $TEMPFILE $arquivo4
#           # ##VOTOS
#           #     #prefeitos #votos6 - parte 1
#           #     echo "######################## votos - 01"
#           #     arquivo5=$VOTOS$partido$FINAL
#           #     regEx1=$regTitle
#           #     regEx1+='votos_partidos'
#           #     replace1+="votos_$partido"
#           #     replace1+="_"
#           #     sed -e "s@$regEx1@$replace1\1@g" $arquivo5 | \
#           #     sed -e "s@$regEx2@$replace2@g" > $TEMPFILE
#           #     mv $TEMPFILE $arquivo5
#           #     
#           #     #prefeitos #votos - parte 2 (outros)
#           #     echo "######################## votos outros"
#           #     arquivo6=$VOTOS$partido$OUTROS
#           #     regEx1=$regTitle
#           #     regEx1+='votos_partidos'
#           #     replace1+="votos_$partido"
#           #     replace1+="_"
#           #     sed -e "s@$regEx1@$replace1\1@g" $arquivo6 | \
#           #     sed -e "s@$regEx2@$replace2@g" > $TEMPFILE
#           #     mv $TEMPFILE $arquivo6
#
#    done
}

formataDados2Turno

function removeDadosExtras {
    ARQUIVOS=`ls *.json`
    TEMPFILE="TEMPFILE.tmp"
    for arquivo in $ARQUIVOS
        do
        	sed -e 's@dados2012":\[\(.*\),\(.*\)\]\s*,\s*"valorFinal@dados2012":[0,0],"valorFinal@g' $arquivo > $TEMPFILE
            diff $arquivo $TEMPFILE
            #sed -e 's@\s*,\s*@,@g' $arquivo > $TEMPFILE
            mv $TEMPFILE $arquivo
        done
}

function substituinextlevel {
    ARQUIVOS_VOTOS=`ls votos_*.json`
    ARQUIVOS_ELEITORADO=`ls eleitorado_*.json`
    TEMPFILE="TEMPFILE.tmp"
    for arquivo in $ARQUIVOS_VOTOS
        do
            sed -e 's@prefeitos@votos@g' $arquivo > $TEMPFILE
            mv $TEMPFILE $arquivo
        done
    for arquivo in $ARQUIVOS_ELEITORADO
        do
            sed -e 's@prefeitos@eleitorado@g' $arquivo > $TEMPFILE
            mv $TEMPFILE $arquivo
        done
}

function mudaConteudo {
    ARQUIVOS_PREFEITOS=`ls prefeitos*`
    ARQUIVOS_VOTOS=`ls votos*`
    ARQUIVOS_ELEITORADO=`ls eleitorado*`
    TEMPFILE="TEMPFILE.tmp"
    
    for arquivo in $ARQUIVOS_PREFEITOS 
        do
            #echo "$arquivo"
            #sed -e 's/nextlevel":"/nextlevel":"prefeitos_/' $arquivo > $TEMPFILE
            sed -e 's@\[30,30,1200\]@[valor_1,valor_2,valor_maximo]@g' $arquivo > $TEMPFILE
            mv $TEMPFILE $arquivo
        done
    
    for arquivo in $ARQUIVOS_VOTOS
        do
            #sed -e 's/nextlevel":"/nextlevel":"votos_/' $arquivo > $TEMPFILE
            mv $TEMPFILE $arquivo
        done
    
    for arquivo in $ARQUIVOS_ELEITORADO
        do
            #sed -e 's/nextlevel":"/nextlevel":"eleitorado_/' $arquivo > $TEMPFILE
            mv $TEMPFILE $arquivo
        done
}

function geraArquivosCopiados {
    #PARTIDOS=`cat lista_partidos`
    PARTIDOS=`tr '[A-Z]' '[a-z]' < lista_partidos`
    FINAL="_estados.json"
    
    for partido in $PARTIDOS
            do
                cp partido_estados.json $partido$FINAL
            done
}

function gera_outros_estados {
    BASE="estados.json"
    for arquivo in `ls *$BASE`
        do
            echo $arquivo | sed 's/(*)estados.json/\1estados_outros.json/g'
        done
}

function corrige_estados_iniciais {
    BASE="estados.json"
    TEMPFILE="TEMPFILE.tmp"
    for arquivo in `ls *$BASE`
        do
            sed '/"AM"/d' $arquivo > $TEMPFILE
            cp $TEMPFILE $arquivo
            sed '/"MS"/d' $arquivo > $TEMPFILE
            cp $TEMPFILE $arquivo
            sed '/"SE"/d' $arquivo > $TEMPFILE
            cp $TEMPFILE $arquivo
            sed '/"RO"/d' $arquivo > $TEMPFILE
            cp $TEMPFILE $arquivo
            sed '/"TO"/d' $arquivo > $TEMPFILE
            cp $TEMPFILE $arquivo
            sed '/"AC"/d' $arquivo > $TEMPFILE
            cp $TEMPFILE $arquivo
            sed '/"AP"/d' $arquivo > $TEMPFILE
            cp $TEMPFILE $arquivo
            sed '/"RR"/d' $arquivo > $TEMPFILE
            cp $TEMPFILE $arquivo
        done
}

function ajustaVirgula {
    ARQUIVOS=`ls *estados.json`
    TEMPFILE="TEMPFILE.tmp"
    for arquivo in $ARQUIVOS
        do
            sed '19s@\(.*\),$@\1@g' $arquivo > $TEMPFILE
            cp $TEMPFILE $arquivo
        done
}

