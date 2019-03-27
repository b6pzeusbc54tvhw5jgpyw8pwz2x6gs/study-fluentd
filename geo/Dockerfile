FROM fluent/fluentd:v1.3.3-1.0

USER root

RUN apk add --no-cache --update --virtual .build-deps \
        sudo build-base ruby-dev
RUN apk add automake autoconf libtool geoip-dev
RUN gem install \
        fluent-plugin-secure-forward \
        fluent-plugin-elasticsearch \
        fluent-plugin-route \
        fluent-plugin-elb-log

RUN gem install dig_rb geoip-c geoip2_c
RUN gem install fluent-plugin-geoip

RUN gem sources --clear-all
RUN apk del .build-deps
RUN rm -rf /home/fluent/.gem/ruby/2.3.0/cache/*.gem

USER fluent

EXPOSE 24284
