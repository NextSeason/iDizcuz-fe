#! /bin/sh

PWD=`pwd`;

MODULES=(
    'common'
    'commonMobile'
    'account'
    'accountMobile'
    'article'
    'articleMobile'
    'home'
    'homeMobile'
    'message'
    'messageMobile'
    'mis'
    'misMobile'
    'settings'
    'settingsMobile'
    'topic'
    'topicMobile'
    'user'
    'userMobile'
);

for module in ${MODULES[*]}
do

    echo "\033[41;37m Compiling modue $module \033[0m";
    cd "$PWD/$module"; grunt; cd ..;
done
