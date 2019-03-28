# fluentd 란
로그 스태시 같은 Opensource log collector. 단순한 아키텍쳐와 안정성이 장점.

Fluentd treats logs as JSON, a popular machine-readable format.
It is written primarily in C with a thin-Ruby wrapper that gives users flexibility.

- https://www.fluentd.org/architecture

# logs are streams not files
Logs are usually rotated on an hourly or daily basis based on time or size. This system quickly produces many large log files that need to be batch imported for further analysis. This is an outdated approach. Logs are better treated as continuously generated STREAMS as opposed to files.

- https://adam.herokuapp.com/past/2011/4/1/logs_are_streams_not_files/

## td-agent?
Treasure Data, Inc. maintains stable packages for Fluentd and canonical plugins as Treasure Agent (the package is called td-agent). td-agent has v2 and v3. td-agent v2 for the production and v3 is the new stable version for working with ruby 2.4 and fluetnd v1 series.

fluentd v0.12 (td-agent2)
fluentd v1 (td-agent3)

```bash
$ docker run --rm fluent/fluentd fluentd --version
```

## Event structure
Fluentd event consists of tag, time and record.

tag: Where an event comes from. For message routing
time: When an event happens. Epoch time
record: Actual log content. JSON object


### Plugins
Fluentd has 7 types of plugins: Input, Parser, Filter, Output, Formatter, Storage and Buffer.

## 구조
- Input - Parser - Engine - Filter - Buffer - Output - Formatter 7개의 컴포넌트로 구성.
- Input - Engine - Output 이 기본.

## Demo 1 - input plugin
data source 로 부터 Fluentd event 를 생성.

- demo file repo: https://github.com/b6pzeusbc54tvhw5jgpyw8pwz2x6gs/study-fluentd

```bash
$ docker run -p 8888:8888 -v $PWD:/fluentd/etc fluent/fluentd fluentd -v -c /fluentd/etc/fluentd-010-http-stdout.conf
```

```bash
$ curl -X POST -d 'json={"action":"login", "user": "foo"}' http://localhost:8888/log.test
$ curl -X POST -d 'json={"action":"login", "user": "foo"}' http://localhost:8888/log.test?time=1518756037.3137116
```

- in_http: http endpoint 로 부터
- in_tail: file 의 텍스트 라인으로부터

## Demo 2 - filter plugin

```bash
$ docker run -p 8888:8888 -v $PWD:/fluentd/etc fluent/fluentd fluentd -v -c /fluentd/etc/fluentd-020-filter.conf
```

```bash
$ curl -X POST -d 'json={"action":"login", "user": "foo"}' http://localhost:8888/log.test
$ curl -X POST -d 'json={"action":"output", "user": "foo"}' http://localhost:8888/log.test
```

### Filter plugin
A Filter aims to behave like a rule to pass or reject an event.

## Demo 3 - label, include

```bash
$ docker run -p 8888:8888 -v $PWD:/fluentd/etc fluent/fluentd fluentd -v -c /fluentd/etc/fluentd-030-label.conf
```

### label & include
This new implementation called Labels, aims to solve the configuration file complexity and allows to define new Routing sections that do not follow the top to bottom order, instead it acts like linked references.

The values of @label parameter MUST start with @ character.

Specifying @label is strongly recommended to route events to any plugins, without modifying tags. It can make the whole configurations simple.

- https://docs.fluentd.org/v0.12/articles/config-file#(5)-group-filter-and-output:-the-%E2%80%9Clabel%E2%80%9D-directive

```bash
$ docker run -p 8888:8888 -v $PWD:/fluentd/etc fluent/fluentd fluentd -v -c /fluentd/etc/fluentd-035-include.conf
```

## Demo 4 - buffer plugin

- https://docs.fluentd.org/v1.0/articles/buffer-section

### Buffer plugin
Buffer plugins are used by output plugins. For example, out_s3 uses buf_file by default to store incoming stream temporally before transmitting to S3.

Output plugin in buffered mode stores received events into buffers first and write out buffers to a destination by meeting flush conditions. 

A buffer is essentially a set of “chunks”

```bash
$ docker run -p 8888:8888 -v $PWD:/fluentd/etc fluent/fluentd fluentd -v -c /fluentd/etc/fluentd-040-buffer.conf
```

### S3 plugin with buffer

- https://docs.fluentd.org/v1.0/articles/buffer-plugin-overview

```bash
$ terraform apply
$ terraform state show aws_s3_bucket.b
$ aws s3 ls s3://<bucket-name>
$ vi fluentd-045-s3.conf  # insert bucket name
$ docker build -t myfd:1 .
$ docker run -p 8888:8888 -v $PWD:/fluentd/etc -u root -e AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID -e AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY myfd:1 fluentd -v -c /fluentd/etc/fluentd-045-s3.conf
```

## config
List of Directives
The configuration file consists of the following directives:

1. source directives determine the input sources.
2. match directives determine the output destinations.
3. filter directives determine the event processing pipelines.
4. system directives set system wide configuration.
5. label directives group the output and filter for internal routing
6. @include directives include other files.

- https://docs.fluentd.org/v1.0/articles/plugin-common-parameters
- https://docs.fluentd.org/v1.0/articles/system-config

## Demo 5 - parser plugin

```bash
$ docker run -v $PWD:/fluentd/etc fluent/fluentd fluentd -v -c /fluentd/etc/fluentd-050-parser-apache2.conf
```

```
$ vi common.log
```

```
$ echo '109.169.248.247 - - [12/Dec/2015:18:25:11 +0100] "GET /administrator/ HTTP/1.1" 200 4263 "-" "Mozilla/5.0 (Windows NT 6.0; rv:34.0) Gecko/20100101 Firefox/34.0"' >> apache.log
```

- https://docs.fluentd.org/v1.0/articles/parser_apache2

Some of Fluentd’s plugins support the `<parse>` section to specify how to parse raw data.

Parse section can be in `<source>`, `<match>` or `<filter>` sections. It’s enabled for plugins which support parser plugin features.

### Regexp parse plugin

```bash
$ docker run -v $PWD:/fluentd/etc fluent/fluentd fluentd -v -c /fluentd/etc/fluentd-055-parser-regexp.conf
```

```bash
$ echo '109.169.248.247 - - [12/Dec/2015:18:25:11 +0100] "GET /administrator/ HTTP/1.1" 200 4263 "-" "Mozilla/5.0 (Windows NT 6.0; rv:34.0) Gecko/20100101 Firefox/34.0" "-"' >> apache.log
```

```
$ wget http://www.almhuette-raith.at/apache-log/access.log
```

## Demo 6 - formatter plugin

```bash
$ docker run -p 8888:8888 -v $PWD:/fluentd/etc myfd:1 fluentd -v -c /fluentd/etc/fluentd-060-formatter-json.conf
```

```bash
$ docker run -p 8888:8888 -v $PWD:/fluentd/etc myfd:1 fluentd -v -c /fluentd/etc/fluentd-065-formatter-csv.conf
```

Sometimes, the output format for an output plugin does not meet one’s needs. Fluentd has a pluggable system called Text Formatter that lets the user extend and re-use custom output formats.

## Demo 7 - routing

```bash
$ docker run -v $PWD:/fluentd/etc myfd:1 fluentd -v -c /fluentd/etc/fluentd-070-route.conf
```
- https://docs.fluentd.org/v1.0/articles/routing-examples

```bash
$ docker run -v $PWD:/fluentd/etc fluent/fluentd fluentd -v -c /fluentd/etc/fluentd-075-copy.conf
```

- https://docs.fluentd.org/v1.0/articles/out_copy

## Demo 8 - docker logging driver

- https://docs.docker.com/v17.09/engine/admin/logging/overview/#supported-logging-drivers

```bash
$ docker run -p 24224:24224 -p 24224:24224/udp -v $PWD:/fluentd/etc fluent/fluentd fluentd -v -c /fluentd/etc/fluentd-080-docker-logging-driver.conf
```

```bash
$ docker run -p8001:5678 -d --log-driver=fluentd fluentd-address=172.17.0.2:24224 hashicorp/http-echo -text "8001 hello"

$ docker run -p8002:5678 -d --log-driver=fluentd fluentd-address=172.17.0.2:24224 hashicorp/http-echo -text "8002 hello"
```

`fluentd-address=172.17.0.2:24224` 를 붙여야만 잘 되는건 
docker for mac 환경이라 그런건가?

## Demo 9 - EFK

```bash
$ docker-compose up -d
$ curl http://127.0.0.1/
$ curl http://127.0.0.1/
$ curl http://127.0.0.1/
$ open http://127.0.0.1:5601/
```

> docker for mac 이라면 여기서도 마찬가지로 fluentd-address 에 ip 를 직접 넣어줘야...

- https://kelonsoftware.com/fluentd-docker-logging/


## Demo 10 - geoip with EFK, nodejs fluentd logger

```bash
$ cd geo
$ docker build -t myfd:geo .
$ docker run -p 24224:24224 -v $PWD:/fluentd/etc myfd:geo fluentd -v -c /fluentd/etc/fluentd-090-geoip.conf
```

```bash
$ node emit-log.js
```

## fluentd on k8s
- https://medium.com/attest-engineering/kubernetes-logs-to-aws-cloudwatch-with-fluentd-ede8d88a1b4e

## fluentd-bit
- https://fluentbit.io/documentation/0.8/about/fluentd_and_fluentbit.html

## 레퍼런스
- 공식사이트:
    - https://www.fluentd.org/
    - https://docs.fluentd.org/v1.0/articles/quickstart

- 깃허브: https://github.com/fluent/fluentd
- 조대협님: https://bcho.tistory.com/1115
- 김대리님: https://dev-life.tistory.com/2
- 조은우님: https://blog.jonnung.com/system/2018/04/06/fluentd-log-collector-part1
- td-agent: https://support.treasuredata.com/hc/en-us/articles/360000687108-Overview-of-Server-Side-Agent-td-agent-


